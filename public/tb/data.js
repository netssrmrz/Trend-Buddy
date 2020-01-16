
class Db
{
  constructor()
  {
    var config;

    config =
    {
      apiKey: "AIzaSyAITTb3Fxh1HiyFxdObmgZ2LqJZm38EQ5k",
      authDomain: "trend-buddy.firebaseapp.com",
      databaseURL: "https://trend-buddy.firebaseio.com",
      storageBucket: "trend-buddy.appspot.com",
      messagingSenderId: "603649293586"
    };
    firebase.initializeApp(config);
    this.conn = firebase.database();

    this.use_cache = true;
    this.use_db_cache = false;
    this.cache = [];
  }

  Exists_In_Cache2(key, on_success_fn)
  {
    if (this.use_cache)
    {
      if (this.cache[key] != null)
      {
        on_success_fn(true);
      }
      else
      {
        this.conn.ref("/cache/" + key).once('value').then(Cache_Read_OK);
        function Cache_Read_OK(query_res)
        {
          var val = query_res.val();
          if (val)
            on_success_fn(true);
          else
            on_success_fn(false);
        }
      }
    }
    else
      on_success_fn(false);
  }

  Get_From_Cache2(key, parse_fn, on_success_fn)
  {
    var cache, val;

    cache = this.cache;
    val = this.cache[key];
    if (val == null)
    {
      this.conn.ref("/cache/" + key).once('value').then(Then_OK);
      function Then_OK(query_res)
      {
        val = query_res.val();
        val = JSON.parse(val);
        if (parse_fn)
          val = parse_fn(val);
        cache[key] = val;
        on_success_fn(val);
      }
    }
    else
      on_success_fn(val);
  }

  Insert_In_Cache2(key, val, on_success_fn)
  {
    //console.log("Db.Insert_In_Cache2: key =", key);
    if (this.use_cache)
    {
      if (val == undefined)
        val = null;
      this.cache[key] = val;
      this.conn.ref("/cache/" + key).set(JSON.stringify(val), Insert_OK);
      function Insert_OK()
      {
        on_success_fn(val);
      }
    }
    else
      on_success_fn(val);
  }

  If_Not_In_Cache2(key, get_val_fn, parse_fn, on_success_fn)
  {
    var val = null, db = this;

    db.Exists_In_Cache2(key, Exists_OK);
    function Exists_OK(exists)
    {
      if (exists)
      {
        val = db.Get_From_Cache2(key, parse_fn, on_success_fn);
      }
      else
      {
        get_val_fn();
      }
    }
  }

  // Async cache ==================================================================================
  
  async Get_From_Cache(key)
  {
    let res = { not_in_cache: true };

    if (this.use_cache)
    {
      if (this.cache[key] != undefined)
      {
        res = this.cache[key];
      }
      else if (this.use_db_cache)
      {
        const query_res = await this.conn.ref("/cache/" + key).once('value');
        const val = query_res.val();
        if (val)
        {
          res = JSON.parse(val);
          this.cache[key] = res;
        }
      }
    }

    return res;
  }

  async Insert_In_Cache(key, val)
  {
    if (this.use_cache)
    {
      if (val == undefined)
        val = null;
      this.cache[key] = val;

      if (this.use_db_cache)
      {
        await this.conn.ref("/cache/" + key).set(JSON.stringify(val));
      }
    }
  }

  async Delete_From_Cache(key)
  {
    this.cache[key] = undefined;

    if (this.use_db_cache)
    {
      await this.conn.ref("/cache/" + key).remove();
    }
  }

  // General data access ==========================================================================

  Select_Obj(path, on_success_fn)
  {
    //console.log("Db.Select_Obj: path =", path);
    this.conn.ref(path).once('value').then(Then_OK);
    function Then_OK(query_res)
    {
      if (on_success_fn != null)
        on_success_fn(Db.To_Obj(query_res));
    }
  }

  Select_Objs(path, on_success_fn, order_by)
  {
    var ref;

    ref = this.conn.ref(path);
    if (order_by)
      ref = ref.orderByChild(order_by);
    ref.once('value').then(Then_OK);
    function Then_OK(query_res)
    {
      Db.To_Array(query_res, on_success_fn);
    }
  }

  Insert(path, obj, on_success_fn)
  {
    //console.log("Insert");
    obj.id = this.conn.ref(path).push().key;
    this.conn.ref(path + "/" + obj.id).set(obj, on_success_fn);
  }

  Update(path, obj, on_success_fn)
  {
    //console.log("Update");
    var ref, promise;

    try
    {
      ref = this.conn.ref(path + "/" + obj.id);
      promise = ref.set(obj);
      promise.then(on_success_fn, on_success_fn);
    }
    catch (err)
    {
      on_success_fn(err);
    }
  }

  static To_Obj(query_res)
  {
    return query_res.val();
  }

  static To_Array(query_res, success_fn)
  {
    var val, vals = null, keys, c;

    val = query_res.val();
    if (val != null)
    {
      if (val.constructor === Array)
        vals = val;
      else
      {
        vals = new Array();
        keys = Object.keys(val);
        for (c = 0; c < keys.length; c++)
        {
          vals.push(val[keys[c]]);
        }
      }
    }

    if (success_fn != null)
      success_fn(vals);
    else
      return vals;
  }

  static Get_Table(obj)
  {
    return obj.constructor.name.toLowerCase();
  }
}

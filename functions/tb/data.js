const functions = require('firebase-functions');
const firebase = require('firebase-admin');

class Db
{
  constructor()
  {
    const config = Db.Get_Config();
    firebase.initializeApp(config);
    this.conn = firebase.database();
    console.log("Db.constructor(): db host =", this.conn.repo_.repoInfo_.host);

    this.use_cache = true;
    this.read_mem_cache = true;
    this.write_mem_cache = true;
    this.read_db_cache = false;
    this.write_db_cache = true;
    this.cache = [];
    this.trace_hits = false;
  }

  static Get_Config()
  {
    let config = null;

    if (Db.Is_Dev())
    {
      const serviceAccount = require('C:\\projects\\Trend-Buddy\\functions\\trend-buddy-firebase-adminsdk-ymhg3-c65d28fe1d.json');
      config =
      {
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "https://trend-buddy-dev.firebaseio.com",
      };
    }
    else
    {
      config = functions.config().firebase;
    }

    return config;
  }

  static Is_Dev()
  {
    return functions.config().firebase == undefined;
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
      Then_OK = Then_OK.bind(this);
      this.conn.ref("/cache/" + key).once('value').then(Then_OK);
      function Then_OK(query_res)
      {
        val = query_res.val();
        val = JSON.parse(val);
        if (parse_fn)
          val = parse_fn(val);
        cache[key] = val;
        on_success_fn(val);
        this.Log("Db.Get_From_Cache2(): Db cache hit for key \"" + key + "\"");
      }
    }
    else
    {
      on_success_fn(val);
      this.Log("Db.Get_From_Cache2(): Mem. cache hit for key \"" + key + "\"");
    }
  }

  Insert_In_Cache2(key, val, on_success_fn)
  {
    if (this.use_cache)
    {
      if (val == undefined)
        val = null;
    this.cache[key] = val;
      Insert_OK = Insert_OK.bind(this);
    this.conn.ref("/cache/" + key).set(JSON.stringify(val), Insert_OK);
    function Insert_OK()
    {
      on_success_fn(val);
        this.Log("Db.Insert_In_Cache2(): Db cache update for key \"" + key + "\"");
    }
  }
    else
    {
      on_success_fn(val);
      this.Log("Db.Insert_In_Cache2(): Mem. cache update for key \"" + key + "\"");
    }
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

  Log(msg)
  {
    if (this.trace_hits)
    {
      console.log(msg);
    }
  }

  // Async cache ==================================================================================
  
  async Get_From_Cache(key)
  {
    let res = { not_in_cache: true };

    if (this.use_cache)
    {
      if (this.read_mem_cache)
      {
        const val = this.cache[key];
        if (val != undefined)
      {
          res = val;
        this.Log("Db.Get_From_Cache(): Mem. cache hit for key \"" + key + "\"");
      }
      }
      else if (this.read_db_cache)
      {
        const query_res = await this.conn.ref("/cache/" + key).once('value');
        const val = query_res.val();
        if (val)
        {
          res = JSON.parse(val);
          this.cache[key] = res;
          this.Log("Db.Get_From_Cache(): Db cache hit for key \"" + key + "\"");
        }
      }
    }

    return res;
  }

  async Insert_In_Cache(key, val)
  {
    if (this.use_cache)
    {
      if (this.write_mem_cache)
      {
      if (val == undefined)
        val = null;
      this.cache[key] = val;
      this.Log("Db.Insert_In_Cache(): Mem. cache update for key \"" + key + "\"");
      }

      if (this.write_db_cache)
      {
        await this.conn.ref("/cache/" + key).set(JSON.stringify(val));
        this.Log("Db.Insert_In_Cache(): Db cache update for key \"" + key + "\"");
      }
    }
  }

  async Delete_From_Cache(key)
  {
    if (this.use_cache)
    {
      if (this.write_mem_cache)
      {
      this.cache[key] = undefined;
      }

      if (this.write_db_cache)
      {
        await this.conn.ref("/cache/" + key).remove();
      }
    }
  }

  async Clr_Cache()
  {
    if (this.use_cache)
    {
      if (this.write_mem_cache)
      {
      this.cache = [];
      }
  
      if (this.write_db_cache)
      {
        await this.conn.ref("/cache").remove();
      }
    }
  }

  // General data access ==========================================================================

  Select_Obj(path, on_success_fn)
  {
    this.conn.ref(path).once('value').then(Then_OK);
    function Then_OK(query_res)
    {
      if (on_success_fn != null)
        on_success_fn(Db.To_Obj(query_res));
    }
  }

  async Select_Obj_Async(path)
  {
    const query_res = await this.conn.ref(path).once('value');
    const vals = Db.To_Obj(query_res);
      
    return vals;
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

  async Select_Objs_Async(path, order_by)
  {
    var ref, query_res, vals;

    ref = this.conn.ref(path);
    if (order_by)
      ref = ref.orderByChild(order_by);
    query_res = await ref.once('value');
    vals = Db.To_Array(query_res);
      
    return vals;
  }

  Insert(path, obj, on_success_fn)
  {
    console.log("Db.Insert(): path, obj =", path, obj);
    obj.id = this.conn.ref(path).push().key;
    this.conn.ref(path + "/" + obj.id).set(obj, on_success_fn);
  }

  Update(path, obj, on_success_fn)
    {
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

module.exports = Db;
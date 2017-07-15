
var rs = {};

var category =
{
  Category: function ()
  {

  },

  Insert: function (db, obj, on_success_fn)
  {
    var table;

    updates = new Object();

    obj.id = db.conn.ref("/category").push().key;
    updates["/category/" + obj.id] = obj;

    if (obj.parent_id != null)
      updates["/category/" + obj.parent_id + "/has_children"] = true;
    else
      obj.parent_id = 0;

    db.conn.ref().update(updates, on_success_fn);
  },

  Get_Sub_Cats: function (db, cat, on_success_fn)
  {
    var query, cat_parent_id;

    if (cat == null)
      cat_parent_id = 0;
    else
      cat_parent_id = cat.id;
    query = db.conn.ref('/category').orderByChild("parent_id").equalTo(cat_parent_id);
    res = query.once('value').then(Results_OK);
    function Results_OK(query_res)
    {
      var vals;

      vals = data.To_Array(query_res);
      if (vals != null)
        on_success_fn(vals);
    }
  },
  
  Get_Ids: function (db, parent_acc_id, on_success_fn)
  {
    var query;

    //var userId = firebase.auth().currentUser.uid;
    if (parent_acc_id == null)
      parent_acc_id = 0;
    query = db.ref('/account').orderByChild("parent_id").equalTo(parent_acc_id);
    res = query.once('value').then(Results_OK);
    function Results_OK(query_res)
    {
      var val, vals, keys, c;

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
        on_success_fn(vals);
      }
    }
  },

  Get_All_Ids: function (db, on_success_fn)
  {
    query = db.ref('/account');
    res = query.once('value').then(Results_OK);
    function Results_OK(query_res)
    {
      res = db.To_Array(query_res);
      on_success_fn(res);
    }
  },

  Get_All_Sub_Ids: function (db)
  {
    db.ref("/subaccount").then(Results_OK);
    function Results_OK(res)
    {
      res = db.To_Array(res);
    }
  },

  Get_One: function (db, id, on_success_fn)
  {
    var query;

    //var userId = firebase.auth().currentUser.uid;
    if (id != null)
    {
      query = db.ref('/account/' + id);
      res = query.once('value').then(Results_OK);
      function Results_OK(query_res)
      {
        var acc;

        acc = query_res.val();
        acc.id = query_res.key;
        on_success_fn(acc);
      }
    }
  },

  Add: function (db, acc, on_success_fn)
  {
    var acc_id, updates, sub_id;

    acc_id = db.ref("/account").push().key;
    sub_id = db.ref("/subaccount/" + acc.parent_id).push().key;
    updates = new Object();
    updates["/account/" + acc_id] = acc;
    updates["/subaccount/" + acc.parent_id + "/" + sub_id] = acc_id;
    db.ref().update(updates, on_success_fn);
  },

  Traverse_Tree: function (db, acc_id, on_acc_fn, level)
  {
    if (level == null)
      level = 0;

    Get_Accounts_OK.on_acc_fn = on_acc_fn;
    account.Get_List(db, acc_id, Get_Accounts_OK);
    function Get_Accounts_OK(acc_ids)
    {
      var c, data;

      if (acc_ids != null && acc_ids.length > 0)
      {
        for (c = 0; c < acc_ids.length; c++)
        {
          Get_Account_OK.on_acc_fn = Get_Accounts_OK.on_acc_fn;
          account.Get_One(db, acc_ids[c], Get_Account_OK);
          function Get_Account_OK(acc)
          {
            Get_Account_OK.on_acc_fn(acc, level);
            if (acc != null)
            {
              account.Traverse_Tree(db, acc.id, Get_Account_OK.on_acc_fn, level + 1);
            }
          }
        }
      }
    }
  },

  Delete: function (db, acc, on_success_fn)
  {
    var table;

    updates = new Object();

    acc.id = db.conn.ref("/account").push().key;
    updates["/account/" + acc.id] = acc;

    if (acc.parent_id != null)
      updates["/account/" + acc.parent_id + "/has_children"] = true;
    else
      acc.parent_id = 0;

    db.conn.ref().update(updates, on_success_fn);
  }
};

var transaction =
{
  Transaction: function ()
  {
    this.id = null;
    this.amount = 0;
    this.account_id = null;
    this.span = null; // daily, weekly, fortnightly, monthly, yearly
    this.step = 1; // every x days, every x weeks, ...
    this.start_date = null;
    this.end_date = null;
    this.limit = null; // fixed number of event instances
    this.misc = null; // weekly start day, monthly same day
    this.description = null;
  },

  Select_Objs: function (db, on_success_fn)
  {
    db.conn.ref('/transaction').once('value').then(Results_OK);
    function Results_OK(query_res)
    {
      on_success_fn(data.To_Array(query_res));
    }
  },

  Insert: function (db, obj, on_success_fn)
  {
    obj.id = db.conn.ref("/transaction").push().key;
    db.conn.ref("/transaction/" + obj.id).set(obj, on_success_fn);
  },

  Update: function (db, obj, on_success_fn)
  {
    db.conn.ref("/transaction/" + obj.id).set(obj, on_success_fn);
  },

  Delete: function (db, obj, on_success_fn)
  {
    db.conn.ref("/transaction/" + obj.id).remove(on_success_fn);
  }
};

var data =
{
  Db: function ()
  {
    var config;

    config =
    {
      apiKey: "AIzaSyA248DtHRB5WIBzl0vKnUVqE2CrG0LZ5lM",
      authDomain: "kaster-63204.firebaseapp.com",
      databaseURL: "https://kaster-63204.firebaseio.com",
      storageBucket: "kaster-63204.appspot.com",
      messagingSenderId: "469159266961"
    };
    firebase.initializeApp(config);
    this.conn = firebase.database();
  },

  To_Array: function (query_res)
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
    return vals;
  },

  Get_Table: function (obj)
  {
    return obj.constructor.name.toLowerCase();
  },
};

var obj =
  {
    Obj: function ()
    {
      this.id = null;
      this.amount = 0;
      this.account_id = null;
      this.date = null;
    },

    Select_Ids: function (db, on_success_fn)
    {

    },

    Select_Objs: function (db, on_success_fn)
    {

    },

    Select_Obj: function (db, id, on_success_fn)
    {

    },

    Insert: function (db, obj, on_success_fn)
    {
    },

    Update: function (db, obj, on_success_fn)
    {

    },

    Delete: function (db, id, on_success_fn)
    {

    }
  };

rs.event =
{
  Event: function ()
  {
    this.id = null;
    this.amount = 0;
    this.account_id = null;
    this.span = null; // daily, weekly, fortnightly, monthly, yearly
    this.step = 1; // every x days, every x weeks, ...
    this.start_date = null;
    this.end_date = null;
    this.limit = null; // fixed number of event instances
    this.misc = null; // weekly start day, monthly same day
  },

  Interpolate_Events: function (event)
  {
    var res = null, inc_fn = null;

    if (event.start_date != null && event.end_date != null)
    {
      if (event.span == "daily")
      {
        inc_fn = function (curr_date, step)
        {
          curr_date.setDate(curr_date.getDate() + step);
        };
      }
      else if (event.span == "weekly")
      {
        inc_fn = function (curr_date, step)
        {
          curr_date.setDate(curr_date.getDate() + (step * 7));
        };
      }
      else if (event.span == "monthly")
      {
        inc_fn = function (curr_date, step) 
        {
          curr_date.setMonth(curr_date.getMonth() + step);
        };
      }
      else if (event.span == "yearly")
      {
        inc_fn = function (curr_date, step) 
        {
          curr_date.setYear(curr_date.getYear() + step);
        };
      }

      res = rs.event.Interpolate_By_Fn(this, inc_fn);
    }
    return res;
  },

  Interpolate_By_Fn: function (event, inc_fn)
  {
    var cont, res = null, curr_date;

    cont = true;
    res = [];
    curr_date = event.start_date;
    while (cont)
    {
      res.push(curr_date);
      curr_date = new Date(curr_date.valueOf());
      inc_fn(curr_date, event.step);

      if ((curr_date > event.end_date) ||
        (event.limit != null && res.length == event.limit))
        cont = false;
    }

    if (res.length == 0)
      res = null;

    return res;
  },

  Select_Ids: function (db, on_success_fn)
  {

  },

  Select_Objs: function (db, on_success_fn)
  {

  },

  Select_Obj: function (db, id, on_success_fn)
  {

  },

  Insert: function (db, obj, on_success_fn)
  {
  },

  Update: function (db, obj, on_success_fn)
  {

  },

  Delete: function (db, id, on_success_fn)
  {

  }
};

var entry =
{
  Entry: function ()
  {
    this.id = null;
    this.amount = 0;
    this.account_id = null;
    this.date = null;
  },

  Select_Ids: function (db, on_success_fn)
  {
    db.conn.ref('/entry').once('value').then(Results_OK);
    function Results_OK(query_res)
    {
      on_success_fn(data.To_Array(query_res));
    }
  },

  Select_Objs: function (db, on_success_fn)
  {
    db.conn.ref('/entry').once('value').then(Results_OK);
    function Results_OK(query_res)
    {
      on_success_fn(data.To_Array(query_res));
    }
  },

  Select: function (db, id, on_success_fn)
  {

  },
  
  Select_Date_Range: function (db, start, end, fn)
  {
    var
      query, on_success_fn;

    on_success_fn = fn;
    query = db.conn.ref("/entry");
    query = query.orderByChild("date").startAt(start).endAt(end);
    query.once("value").then(Results_OK);
    function Results_OK(query_res)
    {
      on_success_fn(data.To_Array(query_res));
    }
  },

  Insert: function (db, obj, on_success_fn)
  {
    var table;

    table = data.Get_Table(obj);
    obj.id = db.conn.ref("/"+table).push().key;
    db.conn.ref("/" + table + "/" + obj.id).set(obj, on_success_fn);
  },

  Update: function (db, obj, on_success_fn)
  {

  },

  Delete: function (db, id, on_success_fn)
  {

  }
};

function Clr_Child_Elems(elem, start)
{
  if (start==null)
    start = 0;

  while (elem.children.length > start)
    //elem.children[start].remove();
    Polymer.dom(elem).removeChild(elem.children[start]);
}

function Empty(obj)
{
  var res = true;

  if (obj != null && obj.length == null)
    res = false;
  else if (obj!=null && obj.length!=null && obj.length>0)
    res = false
  return res;
}

function Add_Days (date, days)
{
  var new_date = new Date(date.valueOf());
  new_date.setDate(new_date.getDate() + days);
  return new_date;
}

function Polyfills()
{
  if (!String.prototype.repeat)
  {
    String.prototype.repeat = function (count)
    {
      'use strict';
      if (this == null)
      {
        throw new TypeError('can\'t convert ' + this + ' to object');
      }
      var str = '' + this;
      count = +count;
      if (count != count)
      {
        count = 0;
      }
      if (count < 0)
      {
        throw new RangeError('repeat count must be non-negative');
      }
      if (count == Infinity)
      {
        throw new RangeError('repeat count must be less than infinity');
      }
      count = Math.floor(count);
      if (str.length == 0 || count == 0)
      {
        return '';
      }
      // Ensuring count is a 31-bit integer allows us to heavily optimize the
      // main part. But anyway, most current (August 2014) browsers can't handle
      // strings 1 << 28 chars or longer, so:
      if (str.length * count >= 1 << 28)
      {
        throw new RangeError('repeat count must not overflow maximum string size');
      }
      var rpt = '';
      for (; ;)
      {
        if ((count & 1) == 1)
        {
          rpt += str;
        }
        count >>>= 1;
        if (count == 0)
        {
          break;
        }
        str += str;
      }
      // Could we try:
      // return Array(count + 1).join(this);
      return rpt;
    }
  }
}

function WebComponentsReady()
{
  if (!web_components_ready)
  {
    web_components_ready = true;
    Main();
  }
}

var web_components_ready = false;
window.addEventListener('WebComponentsReady', WebComponentsReady);

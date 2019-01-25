const functions = require('firebase-functions');
const admin = require('firebase-admin');
const http = require('http');
//const serviceAccount = require(__dirname + "/trend-buddy-firebase-adminsdk-ymhg3-c65d28fe1d.json");

admin.initializeApp(functions.config().firebase);
//admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: "https://trend-buddy.firebaseio.com"});

exports.updateAllTrends = functions.https.onRequest(Update_All_Trends);

function Update_All_Trends(req, res)
{
  var db =
  {
    conn: admin.database()
  }

  Insert_From_Queries(db, Insert_From_Queries_OK);
  function Insert_From_Queries_OK()
  {
    res.status(200);
    res.end();
  }
}

function Insert_From_Queries(db, on_success_fn)
{
  //console.log("Insert_From_Queries");
  Select_Objs(db, '/query', Select_Objs_OK);
  function Select_Objs_OK(queries)
  {
    var todo = queries.length;

    for (c = 0; c < queries.length; c++)
    {
      Insert_From_Query(db, queries[c], Insert_From_Query_OK);
      function Insert_From_Query_OK()
      {
        //console.log("Insert_From_Queries: ");
        todo--;
        if (todo == 0 && on_success_fn != null)
          on_success_fn();
      }
    }
  }
}

function Insert_From_Query(db, query, on_success_fn)
{
  //console.log("Insert_From_Query");
  Get_Job_Count(query.terms, Get_Job_Count_OK);
  function Get_Job_Count_OK(count)
  {
    var trend;

    trend =
    {
      query_id: query.id,
      datetime: Date.now(),
      count: count
    };
    Insert(db, trend, on_success_fn);
  }
}

function Get_Job_Count(query, success_fn)
{
  var path;

  //console.log("Get_Job_Count");
  path =
    "/ads/apisearch?" +
    "publisher=6433637473123845&" +
    "q=" + encodeURIComponent(query) + "&" +
    "limit=0&" +
    "userip=1.2.3.4&" +
    "useragent=Mozilla/%2F4.0%28Firefox%29&" +
    "v=2&" +
    "format=json";
  Req_Json("trend-buddy.appspot.com", 80, path, Req_Json_OK);
  function Req_Json_OK(res)
  {
    var count = 0;

    if (res != null)
      count = res.totalResults;
    if (success_fn != null)
      success_fn(count);
  }
}

// db =============================================================================================
function Insert(db, obj, on_success_fn)
{
  //console.log("Insert");
  obj.id = db.conn.ref("/trend").push().key;
  db.conn.ref("/trend/" + obj.id).set(obj, on_success_fn)
    .catch(Set_Error);
  function Set_Error(error)
  {
    console.log("Insert: error - ", error);
  }
}

function Select_Objs(db, path, on_success_fn)
{
  //console.log("Select_Objs");
  db.conn.ref(path).once('value').then(Then_OK);
  function Then_OK(query_res)
  {
    //console.log("Select_Objs.Then_OK");
    To_Array(query_res, on_success_fn);
  }
}

// misc ===========================================================================================
function To_Array(query_res, success_fn)
{
  var val, vals = null, keys, c;

  //console.log("To_Array");
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

function Req_Json(host, port, path, success_fn)
{
  var req;

  //console.log("Req_Json: "+path);

  http.get({"host": host, "port": port, "path": path}, Get_OK);
  function Get_OK(resp)
  {
    //console.log("Get_OK");
    resp.on("data", Data_OK);
    function Data_OK(data)
    {
      //console.log("Data_OK: "+data);

      if (success_fn!=null)
        success_fn(JSON.parse(data));
    }
  }
}

function Obj_To_Str(name, obj)
{
  var res = null;

  if (obj != null)
  {
    res = [];
    for (var m in obj)
    {
      if (typeof obj[m] == "function")
        res.push(m + "()");
      else
        res.push(m);
    }
    console.log(name+": ", res);
  }
  else
    console.log(name + " is null");
}

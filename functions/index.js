const functions = require('firebase-functions');
const Db = require('./tb/data');
const Query = require('./tb/query');

var db = new Db();

exports.updateAllTrends = functions.https.onRequest(Update_All_Trends);
function Update_All_Trends(req, res)
{
  Query.Insert_Trends(db, Insert_From_Queries_OK);
  function Insert_From_Queries_OK()
  {
    res.status(200);
    res.end();
  }
}

exports.test = functions.https.onRequest(Test);
function Test(req, res)
{
  Query.Insert_Trends(db, OK2);
  function OK2(data)
  {
    console.log("Test: data =", data);
    res.status(200);
    res.end();
  }
}
const functions = require('firebase-functions');
const Db = require('./tb/data');
const Query = require('./tb/query');
const Indeed = require('./tb/indeed');

var db = new Db();

async function Update_All_Trends()
{
  await db.Clr_Cache();
  await Query.Insert_Trends_Async(db);
  await Query.Select_Child_Objs(db, null);
}

async function Update_All_Trends_Request(req, res)
{
  await Update_All_Trends();

  res.status(200);
  res.end();
}

async function Test_Request(req, res)
{
  const count = await Indeed.Get_Job_Count_By_Scrape("angular (javascript or html)");
  console.log("functions.Test: count = ", count);

  res.status(200);
  res.end();
}

const runtimeOpts = {timeoutSeconds: 540};
exports.updateAllTrendsScheduled = 
  functions.runWith(runtimeOpts).pubsub.schedule('every day 11:30').timeZone("Australia/Sydney").onRun(Update_All_Trends);
exports.updateAllTrends = functions.runWith(runtimeOpts).https.onRequest(Update_All_Trends_Request);
exports.Test = functions.runWith(runtimeOpts).https.onRequest(Test_Request);

const functions = require('firebase-functions');
const Db = require('./tb/data');
const Query = require('./tb/query');

var db = new Db();

const runtimeOpts = {
  timeoutSeconds: 180
}
exports.updateAllTrendsScheduled = 
  functions.runWith(runtimeOpts).pubsub.schedule('every day 11:30').timeZone("Australia/Sydney").onRun(Update_All_Trends);

async function Update_All_Trends(req, res)
{
  await db.Clr_Cache();
  await Query.Insert_Trends_Async(db);
  res.status(200);
  res.end();
}

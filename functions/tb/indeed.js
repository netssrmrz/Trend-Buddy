const Util = require('./init');

class Indeed
{
  static Get_Job_Count(query, success_fn)
  {
    var path;

    //console.log("Indeed.Get_Job_Count: query =", query);
    path =
      "/ads/apisearch?" +
      "publisher=6433637473123845&" +
      "q=" + encodeURIComponent(query) + "&" +
      "limit=0&" +
      "userip=1.2.3.4&" +
      "useragent=Mozilla/%2F4.0%28Firefox%29&" +
      "v=2&" +
      "format=json";
    //Util.Req_Json("trend-buddy.appspot.com", 80, path, Req_Json_OK);
    Util.Req_Json("api.indeed.com", 80, path, Req_Json_OK);
    function Req_Json_OK(res)
    {
      var count = 0;

      if (res != null)
        count = res.totalResults;
      if (success_fn != null)
        success_fn(count);
    }
  }

  static async Get_Job_Count_Async(query)
  {
    //console.log("Indeed.Get_Job_Count_Async: query =", query);
    let count = 0;
    const url =
      //"http://trend-buddy.appspot.com/ads/apisearch?" +
      "http://api.indeed.com/ads/apisearch?" +
      "publisher=6433637473123845&" +
      "q=" + encodeURIComponent(query) + "&" +
      "limit=0&" +
      "userip=1.2.3.4&" +
      "useragent=Mozilla/%2F4.0%28Firefox%29&" +
      "v=2&" +
      "format=json";
    const res = await Util.Req_Json_Async(url);
    if (res)
      count = res.totalResults;

    return count;
  }
}

module.exports = Indeed;
﻿const Util = require('./init');

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
    Util.Req_Json("trend-buddy.appspot.com", 80, path, Req_Json_OK);
    function Req_Json_OK(res)
    {
      var count = 0;

      if (res != null)
        count = res.totalResults;
      if (success_fn != null)
        success_fn(count);
    }
  }
}

module.exports = Indeed;
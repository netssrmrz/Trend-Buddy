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
    {
      if (res.error)
      {
        console.error("Indeed.Get_Job_Count_Async(): error =", res.error);
      }
      else
      {
        console.log("Indeed.Get_Job_Count_Async(): res =", res);
        count = res.totalResults;
      }
    }

    return count;
  }
  
  static async Get_Job_Count_By_Scrape(query)
  {
    //console.log("Indeed.Get_Job_Count_Async: query =", query);
    let count = 0;
    const url =
      "https://www.indeed.com/jobs?" +
      "q=" + encodeURIComponent(query);
    const res_html = await Util.Req_Text(url);
    if (res_html)
    {
      //console.log("Indeed.Get_Job_Count_Async: res_html =", res_html);
      const div_html = Indeed.Extract_Str(res_html, "<div id=\"searchCountPages\">", "</div>", 0);
      if (div_html)
      {
        //console.log("Indeed.Get_Job_Count_Async: div_html = \"", div_html, "\"");
        let count_html = Indeed.Extract_Str(div_html, " of ", " jobs", 0);
        if (count_html)
        {
          count_html = count_html.replace(/\D/g,'');
          //console.log("Indeed.Get_Job_Count_Async: count_html = \"", count_html, "\"");
          count = Number.parseInt(count_html);
        }
      }
    }

    return count;
  }

  static Extract_Str(src, prefix, postfix, from_index)
  {
    let res = null;

    let start_index = src.indexOf(prefix, from_index);
    if (start_index != -1)
    {
      start_index += prefix.length;
      const end_index = src.indexOf(postfix, start_index);
      if (end_index != -1)
      {
        res = src.substring(start_index, end_index);
      }
      else
      {
        res = src.substring(start_index);
      }
    }

    return res;
  }
}

module.exports = Indeed;
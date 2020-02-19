const http = require('http');
const fetch = require('node-fetch');

var web_components_ready = false;

class Util
{
  static Req_Json(host, port, path, success_fn)
  {
    var req;

    //console.log("Req_Json: entry");

    http.get({"host": host, "port": port, "path": path}, Get_OK);
    function Get_OK(resp)
    {
      resp.on("data", Data_OK);
      function Data_OK(data)
      {
        if (success_fn!=null)
          success_fn(JSON.parse(data));
      }
    }
  }

  static async Req_Json_Async(url)
  {
    let res = null;
    const options = {
      method: 'get',
    };

    const request = fetch(url, options);
    const response = await request;
    if (response.ok)
    {
      const response_text = await response.text();
      res = JSON.parse(response_text);
    }

    return res;

  }

  static Clr_Child_Elems(elem, start)
  {
    Util.Clr_Children(elem, start, Polymer.dom(elem).children);
  }

  static Clr_Child_Nodes(elem, start)
  {
    Util.Clr_Children(elem, start, Polymer.dom(elem).childNodes);
  }

  static Clr_Children(elem, start, children)
  {
    var children, c;

    if (start == null)
      start = 0;

    for (c = children.length - 1; c >= start; c--)
      Polymer.dom(elem).removeChild(children[c]);
  }

  static Empty(obj)
  {
    var res = true;

    if (obj != null && obj.length == null)
      res = false;
    else if (obj != null && obj.length != null && obj.length > 0)
      res = false
    return res;
  }

  static Add_Days(date, days)
  {
    var new_date = new Date(date.valueOf());
    new_date.setDate(new_date.getDate() + days);
    return new_date;
  }

  static Polyfills()
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

  static WebComponentsReady()
  {
    if (!web_components_ready)
    {
      web_components_ready = true;
      Main();
    }
  }
  
  static No_Undef(val)
  {
    if (val == undefined)
      val = null;
    return val;
  }

  static To_Int(val)
  {
    var res = val;

    if (val)
    {
      res = parseInt(val);
      if (isNaN(res))
        res = null;
    }
    else
      res = Util.No_Undef(val);

    return res;
  }

  static Hide(elem)
  {
    if (Util.Is_Visible(elem))
    {
    elem.prev_style_display = elem.style.display;
    elem.style.display = "none";
  }
  }

  static Show(elem)
  {
    if (!Util.Is_Visible(elem))
    {
      if (elem.prev_style_display != null && elem.prev_style_display != "none")
    {
      elem.style.display = elem.prev_style_display;
    }
    else
    {
      elem.style.display = "block";
    }
  }
  }

  static Is_Visible(elem)
  {
    let res = false;

    if (elem != null && elem.style.display != null && elem.style.display != "none")
    {
      res = true;
    }

    return res;
  }

  static Clr(elem)
  {
    while (elem.firstChild) 
    {
      elem.removeChild(elem.firstChild);
    }
  }

  static Sort(items, field_name)
  {
    var res = null;

    if (items && items.length > 0)
    {
      res = items.sort(Compare);
    }
  
    return res;

    function Compare(a, b)
    {
      var res, a_val, b_val;

      a_val = a[field_name];
      b_val = b[field_name];
  
      if (a_val && !b_val)
        res = -1;
      else if (!a_val && b_val)
        res = 1;
      else if (!a_val && !b_val)
        res = 0;
      else if (a_val < b_val)
        res = -1;
      else if (a_val > b_val)
        res = 1;
      else
        res = 0;
  
      return res;
    }
  }

  static To_Precision(val, precision)
  {
    const val_num = new Number(val);
    const res = val_num.toPrecision(precision);

    return res;
  }
}
module.exports = Util;
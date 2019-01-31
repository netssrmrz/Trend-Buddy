
var web_components_ready = false;

class Util
{
  static Req_Json(url, success_fn)
  {
    var req;

    req = new XMLHttpRequest();
    req.onreadystatechange = Req_State_Change;
    req.open("GET", url, true);
    req.send();

    function Req_State_Change()
    {
      if (this.readyState == XMLHttpRequest.DONE)
      {
        if (success_fn!=null)
          success_fn(JSON.parse(this.responseText));
      }
    }
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
}

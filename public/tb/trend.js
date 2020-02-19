
class Trend
{
  constructor()
  {
    this.id = null;
    this.query_id = null;
    this.datetime = null;
    this.count = null;
  }

  static Select_Obj(db, id, on_success_fn)
  {
    db.Select_Obj("/trend/" + id, on_success_fn);
  }

  static Select_By_Query_Id(db, query_id, on_success_fn)
  {
    db.conn.ref("/trend").orderByChild("query_id").equalTo(query_id).once("value", OK_Fn);
    function OK_Fn(query_res)
    {
      Db.To_Array(query_res, on_success_fn);
    }
  }

  static async Select_By_Query_Id_Async(db, query_id)
  {
    var key, val;

    key = "Trend-Select_By_Query_Id_" + query_id;
    val = await db.Get_From_Cache(key);
    if (val.not_in_cache)
    {
      const query_res = await db.conn.ref("trend")
        .orderByChild("query_id")
        .equalTo(query_id)
        .once("value");
      val = Db.To_Array(query_res);

      await db.Insert_In_Cache(key, val);
    }

    return val;
  }

  static Select_Chart_Vals_By_Query(db, query, on_success_fn)
  {
    var key;

    key = "Trend-Select_Chart_Vals_By_Query_" + query.id;
    db.If_Not_In_Cache2(key, Get_Vals, Parse_Vals, on_success_fn);
    function Get_Vals()
    {
      Trend.Calc_Chart_Vals_By_Query(db, query, Calc_OK);
      function Calc_OK(vals)
      {
        db.Insert_In_Cache2(key, vals, on_success_fn);
      }
    }
    function Parse_Vals(items)
    {
      var c, item;

      if (items)
        for (c = 1; c < items.length; c++)
        {
          item = items[c];
          item[0] = new Date(item[0]);
        }

      return items;
    }
  }

  static Calc_Chart_Vals_By_Query(db, query, on_success_fn)
  {
    Trend.Select_By_Query_Id(db, query.id, Select_OK);
    function Select_OK(items)
    {
      var c, item_vals, item, vals;

      if (!Util.Empty(items))
      {
        vals = [];
        vals.push(['Date', query.title]);
        for (c = 0; c < items.length; c++)
        {
          item = items[c];
          item_vals = [new Date(item.datetime), item.count];
          vals.push(item_vals);
        }
      }

      on_success_fn(vals);
    }
  }

  static async Calc_Chart_Vals_By_Query_Async(db, query)
  {
    const items = await Trend.Select_By_Query_Id_Async(db, query.id);
    var c, item_vals, item, vals;

    if (!Util.Empty(items))
    {
      vals = [];
      vals.push(['Date', query.title]);
      for (c = 0; c < items.length; c++)
      {
        item = items[c];
        item_vals = [new Date(item.datetime), item.count];
        vals.push(item_vals);
      }
    }

    return vals;
  }

  Insert(db, on_success_fn)
  {
    //console.log("Trend.Insert: this =", this);
    db.Insert("/trend", this, on_success_fn);
  }

  Insert_Async(db)
  {
    return db.Insert("/trend", this);
  }

  Update(db, on_success_fn)
  {

  }

  static Delete(db, id, on_success_fn)
  {
    db.conn.ref("/trend/" + id).remove(on_success_fn);
  }

  static async Select_First_Val(db, query_id)
  {
    var vals, val = 0;

    vals = await Trend.Select_By_Query_Id_Async(db, query_id);
    if (!Util.Empty(vals))
    {
      vals = Util.Sort(vals, "datetime");
      val = vals[0].count;
    }

    return val;
  }

  static async Select_Last_Val(db, query_id)
  {
    var vals, val = 0;

    vals = await Trend.Select_By_Query_Id_Async(db, query_id);
    if (!Util.Empty(vals))
    {
      vals = Util.Sort(vals, "datetime");
      val = vals[vals.length - 1].count;
    }

    return val;
  }

  static async Select_Prev_Val(db, query_id)
  {
    var vals, val = 0;

    vals = await Trend.Select_By_Query_Id_Async(db, query_id);
    if (!Util.Empty(vals))
    {
      vals = Util.Sort(vals, "datetime");
      if (vals.length == 1)
        val = vals[0].count;
      else
        val = vals[vals.length - 2].count;
    }

    return val;
  }

  static async Select_Prev_Month_Val(db, query_id)
  {
    var entries, val = 0, prev_entry, i;

    const millis_per_month = 1000 * 60 * 60 * 24 * 30;
    const month_start = Date.now() - millis_per_month;

    entries = await Trend.Select_By_Query_Id_Async(db, query_id);
    if (!Util.Empty(entries))
    {
      if (entries.length == 1)
        val = entries[0].count;
      else
      {
        for (i=entries.length-1; i>0; i--)
        {
          prev_entry = entries[i-1];
          if (prev_entry.datetime < month_start)
            break;
        }
        val = entries[i].count;
      }
    }

    return val;
  }
}

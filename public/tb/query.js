
class Query
{
  constructor()
  {
    this.id = null;
    this.title = null;
    this.terms = null;
    this.order = null;
    this.parent_id = null;
  }

  static async Select_Objs(db)
  {
    var key, objs;

    key = "Query-Select_Objs";
    objs = await db.Get_From_Cache(key);
    if (objs.not_in_cache)
    {
      objs = await db.Select_Objs_Async("/query");
      if (objs)
      {
        objs.sort(Query.Compare_Order);
      }
  
      await db.Insert_In_Cache(key, objs);
    }

    return objs;
  }

  static Select_Objs_No_Cache(db, on_success_fn)
  {
    db.Select_Objs("/query", Select_OK);
    function Select_OK(objs)
    {
      if (objs)
      {
        objs.sort(Compare_Order);
      }
      on_success_fn(objs);
    }
  }

  static Compare_Order(a, b)
  {
    var res;

    if (a.order && !b.order)
      res = -1;
    else if (!a.order && b.order)
      res = 1;
    else if (!a.order && !b.order)
      res = 0;
    else if (a.order < b.order)
      res = -1;
    else if (a.order > b.order)
      res = 1;
    else
      res = 0;

    return res;
  }

  static Select_Obj(db, id, on_success_fn)
  {
    db.Select_Obj("/query/" + id, on_success_fn);
  }

  static Select_Obj_Async(db, id)
  {
    return db.Select_Obj_Async("/query/" + id);
  }

  static async Select_By_Title(db, title)
  {
    let res;
    
    let ref = db.conn.ref("query");
    ref = ref.orderByChild("title");
    ref = ref.equalTo(title);
    ref = ref.limitToFirst(1);
    const query_res = await ref.once('value');
    const vals = Db.To_Array(query_res);
    if (vals && vals.length>0)
      res = vals[0];

    return res;
  }

  Insert(db, on_success_fn)
  {
    db.Insert("/query", this, on_success_fn);
  }

  Update(db, on_success_fn)
  {
    db.Update("/query", this, on_success_fn);
  }

  Save(db, on_success_fn)
  {
    if (this.id != null)
      this.Update(db, on_success_fn);
    else
      this.Insert(db, on_success_fn);
  }

  static Delete(db, id, on_success_fn)
  {
    db.conn.ref("/query/" + id).remove(Remove_OK);
    function Remove_OK()
    {
      Delete_Trend_Data(db, id, on_success_fn);
    }
  }

  static Delete_Trend_Data(db, query_id, on_success_fn)
  {
    Trend.Select_By_Query_Id(db, query_id, Select_OK);
    function Select_OK(items)
    {
      var c, todo, item;

      if (!Util.Empty(items))
      {
        todo = items.length;
        for (c = 0; c < items.length; c++)
        {
          item = items[c];
          Trend.Delete(db, item.id, Delete_OK);
          function Delete_OK()
          {
            todo--;
            if (todo == 0 && on_success_fn != null)
              on_success_fn();
          }
        }
      }
    }
  }

  static Insert_Trend(db, query, on_success_fn)
  {
    Indeed.Get_Job_Count(query.terms, Get_Job_Count_OK);
    function Get_Job_Count_OK(count)
    {
      var trend;

      trend = new Trend();
      trend.query_id = query.id;
      trend.datetime = Date.now();
      trend.count = count;
      trend.Insert(db, Insert_OK);
      function Insert_OK()
      {
        Trend.Calc_Chart_Vals_By_Query(db, query, Calc_OK);
        function Calc_OK(vals)
        {
          var key = "Select_Chart_Vals_By_Query_" + query.id;
          db.Insert_In_Cache2(key, vals, Cache_Insert_OK);
          function Cache_Insert_OK()
          {
            on_success_fn(query, trend, vals);
          }
        }
      }
    }
  }

  static async Insert_Trend_Async(db, query)
  {
    const count = await Indeed.Get_Job_Count_Async(query.terms);

    const trend = new Trend();
    trend.query_id = query.id;
    trend.datetime = Date.now();
    trend.count = count;
    await trend.Insert_Async(db);

    const vals = await Trend.Calc_Chart_Vals_By_Query_Async(db, query);
    const key = "Trend-Select_Chart_Vals_By_Query_" + query.id;
    await db.Insert_In_Cache(key, vals);

    return {trend, vals};
  }

  static Insert_Trends(db, on_success_fn)
  {
    Query.Select_Objs_No_Cache(db, Select_Objs_OK);
    function Select_Objs_OK(queries)
    {
      var c, todo = queries.length, query;

      for (c = 0; c < queries.length; c++)
      {
        query = queries[c];
        if (!Util.Empty(query.terms))
        {
          Query.Insert_Trend(db, query, Insert_From_Query_OK);
          function Insert_From_Query_OK(query, trend, vals)
          {
            console.log("Query.Insert_Trends: Query \""+query.title+"\" updated with new value \""+trend.count+"\" for a total of "+vals.length+" values");
            todo--;
            if (todo == 0 && on_success_fn != null)
              on_success_fn();
          }
        }
        else
        {
          console.log("Query.Insert_Trends: Query \""+query.title+"\" skipped due to missing query string");
        }
      }
    }
  }
  
  static async Insert_Trends_Async(db)
  {
    var c, query;

    const queries = await Query.Select_Objs(db);
    console.log("Query.Insert_Trends_Async: "+queries.length+" queries to process");
    for (c = 0; c < queries.length; c++)
    {
      query = queries[c];
      console.log("Query.Insert_Trends_Async: query = "+JSON.stringify(query));
      if (!Util.Empty(query.terms))
      {
        const trend_info = await Query.Insert_Trend_Async(db, query);
        console.log("Query.Insert_Trends_Async: Query \""+query.title+"\" updated with new value \""+
          trend_info.trend.count+"\" for a total of "+trend_info.vals.length+" values");
      }
      else
      {
        console.log("Query.Insert_Trends_Async: Query \""+query.title+"\" skipped due to missing query string");
      }
    }
  }
  
  static Has_Children(db, query, on_success_fn)
  {
    var ref;

    ref = db.conn.ref("query");
    ref = ref.orderByChild("parent_id");
    ref = ref.equalTo(query.id);
    ref = ref.limitToFirst(1);
    ref.once('value').then(If_Have_Data);
    function If_Have_Data(query_res)
    {
      var child_query, res = false;

      child_query = Db.To_Obj(query_res);
      if (child_query)
      {
        res = true;
      }

      on_success_fn(query, res);
    }
  }

  static async Select_Child_Objs(db, id)
  {
    var key, val;
    var ref, query_res;

    key = "Query-Select_Child_Objs_" + id;
    val = await db.Get_From_Cache(key);
    if (val.not_in_cache)
    {
      ref = db.conn.ref("query");
      ref = ref.orderByChild("parent_id");
      ref = ref.equalTo(id);
      query_res = await ref.once('value');
      val = Db.To_Array(query_res);
      if (val)
        val.sort(Query.Compare_Order);
  
      await db.Insert_In_Cache(key, val);
    }

    return val;
  }
}

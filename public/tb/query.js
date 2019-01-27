
class Query
{
  constructor()
  {
    this.id = null;
    this.title = null;
    this.terms = null;
  }

  static Select_Objs(db, on_success_fn)
  {
    //console.log("Query.Select_Objs");
    db.Select_Objs("/query", on_success_fn);
  }

  static Select_Obj(db, id, on_success_fn)
  {
    //console.log("Query.Select_Obj: id =", id);
    db.Select_Obj("/query/" + id, on_success_fn);
  }

  Insert(db, on_success_fn)
  {
    db.Insert("/query", this, on_success_fn);
  }

  Update(db, on_success_fn)
  {
    db.conn.ref("/query/" + this.id).set(obj, on_success_fn);
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
    //console.log("Query.Insert_Trend: query =", query);
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
        Trend.Calc_Chart_Vals_By_Query_Id(db, query.id, Calc_OK);
        function Calc_OK(vals)
        {
          var key = "Select_Chart_Vals_By_Query_Id_" + query.id;
          db.Insert_In_Cache2(key, vals, Cache_Insert_OK);
          function Cache_Insert_OK()
          {
            on_success_fn(query, trend, vals);
          }
        }
      }
    }
  }

  static Insert_Trends(db, on_success_fn)
  {
    //console.log("Query.Insert_Trends");
    Query.Select_Objs(db, Select_Objs_OK);
    function Select_Objs_OK(queries)
    {
      var c, todo = queries.length;

      for (c = 0; c < queries.length; c++)
      {
        Query.Insert_Trend(db, queries[c], Insert_From_Query_OK);
        function Insert_From_Query_OK(query, trend, vals)
        {
          console.log("Query.Insert_Trends: Query \""+query.title+"\" updated with new value \""+trend.count+"\" for a total of "+vals.length+" values");
          todo--;
          if (todo == 0 && on_success_fn != null)
            on_success_fn();
        }
      }
    }
  }
}

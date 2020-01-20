const Trend = require('./trend');
const Util = require('./init');
const Indeed = require('./indeed');

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
      objs = await db.Select_Objs("/query");
      if (objs)
      {
        objs.sort(Query.Compare_Order);
      }
  
      await db.Insert_In_Cache(key, objs);
    }

    return objs;
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
    //console.log("Query.Select_Obj: id =", id);
    db.Select_Obj("/query/" + id, on_success_fn);
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

  static async Insert_Trend(db, query)
  {
    //console.log("Query.Insert_Trend: query =", query);
    const count = await Indeed.Get_Job_Count_Async(query.terms);

    const trend = new Trend();
    trend.query_id = query.id;
    trend.datetime = Date.now();
    trend.count = count;
    await trend.Insert(db);

    const vals = await Trend.Calc_Chart_Vals_By_Query(db, query);
    const key = "Trend-Select_Chart_Vals_By_Query_" + query.id;
    await db.Insert_In_Cache(key, vals);

    return {trend, vals};
  }

  static async Insert_Trends(db)
  {
    var c, query;

    const queries = await Query.Select_Objs(db);
    for (c = 0; c < queries.length; c++)
    {
      query = queries[c];
      if (!Util.Empty(query.terms))
      {
        const trend_info = await Query.Insert_Trend(db, query);
        console.log("Query.Insert_Trends: Query \""+query.title+"\" updated with new value \""+
          trend_info.trend.count+"\" for a total of "+trend_info.vals.length+" values");
      }
      else
      {
        console.log("Query.Insert_Trends: Query \""+query.title+"\" skipped due to missing query string");
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

  static Select_Root_Objs(db, on_success_fn)
  {
    Query.Select_Child_Objs(db, null, on_success_fn);
  }

  static async Select_Child_Objs(db, id)
  {
    var ref, query_res, items;

    ref = db.conn.ref("query");
    ref = ref.orderByChild("parent_id");
    ref = ref.equalTo(id);
    query_res = await ref.once('value');

    items = Db.To_Array(query_res);
    if (items)
      items.sort(Query.Compare_Order);

    return items;
  }
}

module.exports = Query;
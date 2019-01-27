const Db = require('./data');
const Util = require('./init');

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

    static Select_Chart_Vals_By_Query_Id(db, query_id, on_success_fn)
    {
      var key;

      key = "Select_Chart_Vals_By_Query_Id_" + query_id;
      db.If_Not_In_Cache2(key, Get_Vals, Parse_Vals, on_success_fn);
      function Get_Vals()
      {
        Trend.Calc_Chart_Vals_By_Query_Id(db, query_id, Calc_OK);
        function Calc_OK(vals)
        {
          db.Insert_In_Cache2(key, vals, on_success_fn);
        }
      }
      function Parse_Vals(items)
      {
        var c, item;

        for (c = 1; c < items.length; c++)
        {
          item = items[c];
          item[0] = new Date(item[0]);
        }

        return items;
      }
    }

    static Calc_Chart_Vals_By_Query_Id(db, query_id, on_success_fn)
    {
      console.log("Trend.Calc_Chart_Vals_By_Query_Id: query_id =", query_id);
      Trend.Select_By_Query_Id(db, query_id, Select_OK);
      function Select_OK(items)
      {
        var c, item_vals, item, vals;

        if (!Util.Empty(items))
        {
          vals = [];
          vals.push(['Date', 'Jobs']);
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

    Insert(db, on_success_fn)
    {
      console.log("Trend.Insert: this =", this);
      db.Insert("/trend", this, on_success_fn);
    }

    Update(db, on_success_fn)
    {

    }

    static Delete(db, id, on_success_fn)
    {
      db.conn.ref("/trend/" + id).remove(on_success_fn);
    }
  };

module.exports = Trend;
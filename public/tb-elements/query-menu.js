import { PolymerElement, html } from '/polymer/polymer/polymer-element.js';
import '/polymer/paper-checkbox/paper-checkbox.js';

class QueryMenu extends PolymerElement
{
  static get template() 
  {
    return html`
      <style>
        :host
        {
          xbackground-color: black;
        }
    
        #menu_items
        {
          overflow: auto;
          height: 100%;
        }

        iron-icon
        {
          color: #616161;
          margin-right: 20px;
          vertical-align: text-bottom;
        }
    
        a
        {
          font-family: roboto-light;
          font-size: 14px;
          display: block;
          padding: 10px 20px 10px 20px;
          background-color: black;
        }
    
        a:hover
        {
          background-color: #004400;
          cursor: pointer;
        }

        paper-checkbox
        {
          float: right;
          --paper-checkbox-unchecked-color: #00ff00;
          --paper-checkbox-checked-color: #00ff00; 
          --paper-checkbox-checkmark-color: #000000;
        }
      </style>

      <a id="load_msg">Loading Menu...</a>
      <div id="menu_items"></div>
    `;
  }

  List_Query_Items(db, On_Show_Chart, On_Choose_Chart)
  {
    Have_Query_Objs = Have_Query_Objs.bind(this);
    Query.Select_Objs(db, Have_Query_Objs);
    function Have_Query_Objs(queries)
    {
      var c, list_elem;

      list_elem = this.$.menu_items;
      this.$.load_msg.style.display = "none";

      for (c = 0; c < queries.length; c++)
      {
        var item_elem, query, chk_elem;

        query = queries[c];
        item_elem = document.createElement("a");
        item_elem.text = query.title;
        item_elem.query = query;
        item_elem.onclick = On_Show_Chart;

        chk_elem = document.createElement("paper-checkbox");
        chk_elem.id = "query_chk_" + query.id;
        chk_elem.query = query;
        chk_elem.onclick = On_Choose_Chart;
        item_elem.appendChild(chk_elem);

        list_elem.appendChild(item_elem);
      }
    }
  }

  Uncheck_All_Queries()
  {
    var chk_elems, i;

    chk_elems = this.$.menu_items.querySelectorAll("paper-checkbox")
    for (i = 0; i < chk_elems.length; i++)
      chk_elems[i].checked = false;
  }
}
customElements.define('query-menu', QueryMenu);

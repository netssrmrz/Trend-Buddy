import { PolymerElement, html } from '/polymer/polymer/polymer-element.js';
import { QueryMenuItem } from '/tb-elements/query-menu-item.js';

class QueryMenu extends PolymerElement
{
  static get template() 
  {
    return html`
      <style>
        @font-face
        {
          font-family: roboto-light;
          src: url(fonts/Roboto-Light.ttf);
        }

        #menu_items::-webkit-scrollbar
        {
          width: 1em;
        }
    
        #menu_items::-webkit-scrollbar-track
        {
          background-color: #002200;
        }
    
        #menu_items::-webkit-scrollbar-thumb
        {
          background-color: #00aa00;
        }

        #menu_items
        {
          overflow: auto;
          height: 100%;
        }
    
        #load_msg
        {
          font-family: roboto-light;
          font-size: 14px;
          display: block;
          padding: 10px 20px 10px 20px;
          background-color: black;
        }
      </style>

      <a id="load_msg">Loading Menu...</a>
      <div id="menu_items"></div>
    `;
  }

  List_Query_Items(db, On_Show_Chart, On_Choose_Chart)
  {
    Have_Query_Objs = Have_Query_Objs.bind(this);
    Query.Select_Root_Objs(db, Have_Query_Objs);
    function Have_Query_Objs(queries)
    {
      var c, list_elem, query, item_elem;

      list_elem = this.$.menu_items;
      this.$.load_msg.style.display = "none";

      for (c = 0; c < queries.length; c++)
      {
        query = queries[c];
        item_elem = new QueryMenuItem(query, On_Show_Chart, On_Choose_Chart);
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

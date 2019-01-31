import { PolymerElement, html } from '/polymer/polymer/polymer-element.js';
import '/polymer/paper-input/paper-input.js';
import '/polymer/paper-button/paper-button.js';

class QueryEditor extends PolymerElement
{
  static get template() 
  {
    return html`
      <style>
        #main
        {
          padding: 40px;
        }
      </style>

      <div id="main">
        <paper-input id="query_id" label="Id" readonly="true"></paper-input>
        <paper-input id="query_title" label="Title"></paper-input>
        <paper-input id="query_terms" label="Search Terms"></paper-input>
        <paper-input id="query_order" label="Order"></paper-input>
        <paper-input id="query_parent" label="Parent"></paper-input>

        <paper-button id="save_btn" on-click="Save" raised>Save</paper-button>
        <paper-button id="del_btn" on-click="Delete" raised>Delete</paper-button>
        <paper-button id="clr_btn" on-click="Clr_Data" raised>Clear Data</paper-button>
      </div>
    `;
  }

  Add()
  {
    this.query_id = null;
    this.$.query_id.value = "";
    this.$.query_title.value = "";
    this.$.query_terms.value = "";
    this.$.query_order.value = "";
    this.$.query_parent.value = "";
  }

  Edit(query)
  {
    if (query != null)
    {
      this.query_id = query.id;
      this.$.query_id.value = query.id;
      this.$.query_title.value = query.title;
      this.$.query_terms.value = query.terms;
      this.$.query_order.value = query.order;
      this.$.query_parent.value = query.parent_id;
    }
  }

  Save()
  {
    var query;

    if (this.on_save_fn != null)
    {
      query = new Query();
      query.id = No_Undef(this.query_id);
      query.title = No_Undef(this.$.query_title.value);
      query.terms = No_Undef(this.$.query_terms.value);
      query.order = No_Undef(this.$.query_order.value);
      query.parent_id = No_Undef(this.$.query_parent.value);
      this.on_save_fn(query);
    }
  }

  Clr_Data()
  {
    if (this.on_clr_data_fn != null && this.query_id != null)
      this.on_clr_data_fn(this.query_id);
  }

  Delete()
  {
    if (this.on_del_fn != null && this.query_id != null)
      this.on_del_fn(this.query_id);
  }
}
customElements.define('query-editor', QueryEditor);

function No_Undef(val)
{
  if (val == undefined)
    val = null;
  return val;
}

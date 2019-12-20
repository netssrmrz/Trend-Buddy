import { PolymerElement, html } from '/polymer/polymer/polymer-element.js';

export class QueryMenuItem extends PolymerElement
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

      <a id="item"><span id="title"></span><paper-checkbox id="checkbox"></a>
    `;
  }

  ready() 
  {
    super.ready();
    
    const item_elem = this.$.item;
    item_elem.query = this.query;
    item_elem.onclick = On_Show_Chart;

    const title_elem = this.$.title;
    title_elem.textContent = this.query.title;

    const chk_elem = this.$.checkbox;
    chk_elem.query = this.query;
    chk_elem.onclick = On_Choose_Chart;
  }

  constructor(query, On_Show_Chart, On_Choose_Chart)
  {
    super();
    this.query = query;
    this.On_Show_Chart = On_Show_Chart;
    this.On_Choose_Chart = On_Choose_Chart;
  }
}
customElements.define('query-menu-item', QueryMenuItem);

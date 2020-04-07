import { PolymerElement, html } from '/polymer/polymer/polymer-element.js';
import '/polymer/paper-spinner/paper-spinner-lite.js';

export class QueryStats extends PolymerElement
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

        :host
        {
          display: inline-block;
          xwidth: 250px;
          xheight: 180px;
          xborder: 1px solid #f00;
          overflow: hidden;
          margin-bottom: 30px;
          margin-right: 30px;
        }

        paper-spinner-lite
        {
          width: 19px;
          height: 19px;
          padding: 0px;
          --paper-spinner-color: #080;
          --paper-spinner-stroke-width: 2px;
        }

        #val_elem
        {
          font-size: 30px;
        }

        .trending-up
        {
          color: #0f0;
        }

        .trending-down
        {
          color: #f00;
          text-shadow: #f00 0px 0px 10px, #f00 0px 0px 10px;
        }

        .trend-icon
        {
          padding: 0px;
          width: 15px;
          height: 15px;
        }

        .val
        {
          display: inline-block;
          width: 158px;
          text-align: right;
        }

        .val_label
        {
          width: 72px;
          display: inline-block;
          text-align: right;
        }

        .val_field
        {
          font-family: hyperspace-bold;
          font-size: 13px;
        }
      </style>

      <div id="title_elem"></div>

      <div id="val_elem"><paper-spinner-lite active></paper-spinner-lite></div> 
      <div id="d_elem" class="val_field">
        <span class="val_label">1day:</span> 
        <div class="val">
          <span id="val_d_elem"></span> 
          <span id="val_d_pct_elem"></span>
          <iron-icon id="val_d_icon_elem" icon="" class="trend-icon"></iron-icon>
          </div>
        </div>
      <div id="month_d_elem" class="val_field">
        <span class="val_label">1month:</span> 
        <div class="val">
          <span id="val_month_d_elem"></span> 
          <span id="val_month_d_pct_elem"></span>
          <iron-icon id="val_month_d_icon_elem" icon="" class="trend-icon"></iron-icon>
          </div>
        </div>
      <div id="overall_d_elem" class="val_field">
        <span class="val_label">Overall:</span> 
        <div class="val">
          <span id="val_overall_d_elem"></span> 
          <span id="val_overall_d_pct_elem"></span>
          <iron-icon id="val_overall_d_icon_elem" icon="" class="trend-icon"></iron-icon>
          </div>
        </div>
      <div id="since_d_elem" class="val_field">
        <span class="val_label">Since:</span> 
        <div class="val">
          <span id="val_since_elem"></span> 
          <span id="val_since_days_elem"></span>
          </div>
        </div>
    `;
  }

  async ready() 
  {
    super.ready();
    this.$.title_elem.textContent = this.query.title;

    const val = await Trend.Select_Last_Val(this.db, this.query.id);
    const prev_val = await Trend.Select_Prev_Val(this.db, this.query.id);
    const prev_month_val = await Trend.Select_Prev_Month_Val(this.db, this.query.id);
    const first_entry = await Trend.Select_First(this.db, this.query.id);
    const first_val = first_entry.count;

    this.$.val_elem.textContent = val;
    
    this.Append_Trend(val, prev_val, this.$.val_d_elem, this.$.val_d_pct_elem, this.$.d_elem, this.$.val_d_icon_elem);
    this.Append_Trend(val, prev_month_val, this.$.val_month_d_elem, this.$.val_month_d_pct_elem, this.$.month_d_elem, this.$.val_month_d_icon_elem);
    this.Append_Trend(val, first_val, this.$.val_overall_d_elem, this.$.val_overall_d_pct_elem, this.$.overall_d_elem, this.$.val_overall_d_icon_elem);
    this.Append_Since(first_entry.datetime);
  }

  Append_Since(millis)
  {
    const date = new Date();
    date.setTime(millis);
    this.$.val_since_elem.textContent = date.toLocaleDateString();

    const days = (Date.now() - millis) / 1000 / 60 / 60 / 24;
    this.$.val_since_days_elem.textContent = "(" + Math.round(days) + "d)";
  }

  Append_Trend(val, prev_val, val_d_elem, val_d_pct_elem, d_elem, icon_elem)
  {
    let d_val = val - prev_val;
    let d_pct_val = Util.To_Precision(d_val / prev_val * 100, 3);
    val_d_elem.textContent = d_val;
    val_d_pct_elem.textContent = "(" + d_pct_val + "%)";
    this.Set_Trend_Icon(d_val, icon_elem);
    this.Add_Trend_Class(d_val, d_elem);
  }

  Set_Trend_Icon(val, elem)
  {
    if (val && val != 0)
    {
      if (val > 0)
        elem.icon = "trending-up";
      else
        elem.icon = "trending-down";
    }
  }

  Add_Trend_Class(val, elem)
  {
    if (val && val != 0)
    {
      if (val > 0)
        elem.classList.add("trending-up");
      else
        elem.classList.add("trending-down");
    }
  }
}
customElements.define('query-stats', QueryStats);

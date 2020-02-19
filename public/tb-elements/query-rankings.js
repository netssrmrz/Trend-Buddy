import { PolymerElement, html } from '/polymer/polymer/polymer-element.js';

export class QueryRankings extends PolymerElement
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
          width: 400px;
          height: 250px;
          xborder: 1px solid #f00;
          overflow: hidden;
        }
      </style>

      <div id="title_div">Rankings</div>
      <div id="chart_div"></div> 
    `;
  }

  async ready() 
  {
    super.ready();
    //this.$.title_div.textContent = this.query.title + " Rankings";
    this.Init_Chart(this.$.chart_div);
  }

  Init_Chart(chart_elem)
  {
    Load_OK = Load_OK.bind(this);
    google.charts.setOnLoadCallback(Load_OK);
    google.charts.load('current', { 'packages': ['corechart'] });
    async function Load_OK()
    {
      const chart = new google.visualization.BarChart(chart_elem);
      chart_elem.chart = chart;

      let draw_data = await this.Data_To_Array(this.child_queries);
      this.Draw_Chart(chart_elem, draw_data);
    }
  }

  Draw_Chart(chart_elem, draw_data)
  {
    var data_table, options;

    data_table = google.visualization.arrayToDataTable(draw_data);
    options = 
    {
      chartArea: { xwidth: "80%", height: "85%" },
      legend:
      {
        position: "none",
        textStyle: { fontName: "roboto", fontSize: 14, color: "#00ff00" }
      },
      animation: { startup: false, duration: 0, easing: 'linear', },
      fontName: "roboto",
      fontSize: 11,
      backgroundColor: "#000000",
      vAxis:
      {
        baselineColor: "#002200",
        gridlines: { color: "#002200" },
        minorGridlines: { color: "#002200" },
        textStyle: { color: "#00ff00" }
      },
      hAxis:
      {
        baselineColor: "#002200",
        gridlines: { color: "#002200" },
        minorGridlines: { color: "#002200" },
        textStyle: { color: "#00ff00" }
      },
      tooltip:
      {
        trigger: "none",
        textStyle: { color: "#00ff00" },
        isHtml: true
      }
    };
    chart_elem.chart.draw(data_table, options);
  }

  async Data_To_Array()
  {
    const titles = ["Tech", "Job Count", { role: 'style' }];
    const values = [titles];

    for (let i=0; i<this.child_queries.length; i++)
    {
      const query = this.child_queries[i];
      const count = await Trend.Select_Last_Val(this.db, query.id);
      const value = [this.Trim(query.title), count, "color: #0c0"];
      values.push(value);
    }

    values.sort(Compare);
    function Compare(a, b)
    {
      let res = 0;

      const a_count = a[1];
      const b_count = b[1];
      if (a_count < b_count)
        res = 1;
      else if (a_count > b_count)
        res = -1;

      return res;
    }

    return values;
  }

  Trim(str)
  {
    let res = str;
    const max_length = 9;

    if (str && str.length>max_length)
    {
      res = str.substring(0, max_length);
    }

    return res;
  }
}
customElements.define('query-rankings', QueryRankings);

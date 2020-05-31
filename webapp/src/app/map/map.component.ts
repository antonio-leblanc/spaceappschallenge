import {Component, OnInit} from '@angular/core';
import {HttpService} from '../http.service';
import * as L from 'leaflet';
import Chart from 'chart.js';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  private _jsonURL = 'assets/data/teste.json';

  constructor(private http: HttpService) {
  }

  public map;
  public usStates: any;
  public brStates: any;
  public info: any;
  public chart: any;
  public plotData: any;
  public covidData: any;

//
  async ngOnInit() {
    this.map = L.map('map', {
      center: [-12.039321, -52.163086],
      zoom: 5
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.brStates = L.geoJSON(this.http.getBRstates()).addTo(this.map)

    this.usStates = L.geoJson(this.http.getUSstates(),
      {
        style: (feature) => {
          return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: this.getColor(feature.properties.density)
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: this.highlightFeature,
            mouseout: (e) => {
              this.usStates.resetStyle(e.target)
              this.info.update();
            }
          })
        }
      }
    );
    this.usStates.addTo(this.map);
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = map => {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + this.getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    // legend.addTo(this.map);


    this.info = L.control();

    this.info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    this.info.update = function (props) {
      this._div.innerHTML = '<h4>Covid Impacts</h4>' + (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Hover over a state');
    };

    this.info.addTo(this.map);


    this.plotData =  await this.http.get(this._jsonURL);
    this.covidData =  await this.http.get('assets/data/teste.json');

    this.chartit();
    
  }


  chartit() {
    var color = Chart.helpers.color;
    var timeFormat = 'MM/DD/YYYY HH:mm';

    let lineChartData = {
      labels: this.plotData.labels,
      datasets: [
        {
        label: this.plotData.datasets[0].label,
        borderColor: color('red').alpha(0.5).rgbString(),
        backgroundColor: color('red').alpha(0.5).rgbString(),
        fill: false,
        data: this.plotData.datasets[0].data,
        yAxisID: "y-axis-1",
        }, 
        {
        label: this.plotData.datasets[1].label,
        borderColor: color('blue').alpha(0.5).rgbString(),
        backgroundColor: color('blue').alpha(0.5).rgbString(),
        fill: false,
        data: this.plotData.datasets[1].data,
        yAxisID: "y-axis-2"
        },
        {
        label: this.plotData.datasets[2].label,
        borderColor: color('green').alpha(0.5).rgbString(),
        backgroundColor: color('green'),
        fill: false,
        data: this.plotData.datasets[2].data,
        yAxisID: "y-axis-3"
        }]
    };

    this.chart = new Chart('canvas', {
      type: "line",
      data: lineChartData,
      options: {
        responsive: true,
        hoverMode: 'index',
        stacked: false,
        title: {
          display: true,
          text: 'Indicators Evolution Over Time'
        },
        scales: {
          yAxes: [{
            type: "linear",
            display: true,
            position: "left",
            id: "y-axis-1",
            ticks: {
              fontColor: color('red').alpha(0.5).rgbString()
            }
          }, {
            type: "linear",
            display: true,
            position: "right",
            id: "y-axis-2",
            gridLines: {
              drawOnChartArea: false,
            },
            ticks: {
              beginAtZero: false,
              min: -100, // minimum value
              max: 100, // maximum value,
              fontColor: color('blue').alpha(0.5).rgbString()
            }
          },
            {
              type: "linear",
              display: true,
              position: "right",
              id: "y-axis-3",
              gridLines: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
              },
              ticks: {
                fontColor: color('green').alpha(0.5).rgbString()
              }
            }],
        }
      }
    })
  }

  getColor(d) {
    return d > 1000 ? '#800026' :
      d > 500 ? '#BD0026' :
        d > 200 ? '#E31A1C' :
          d > 100 ? '#FC4E2A' :
            d > 50 ? '#FD8D3C' :
              d > 20 ? '#FEB24C' :
                d > 10 ? '#FED976' :
                  '#FFEDA0';
  }

  highlightFeature = (e) => {
    var layer = e.target;

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }

    console.log(this)
    this.info.update(layer.feature.properties)
  }

}




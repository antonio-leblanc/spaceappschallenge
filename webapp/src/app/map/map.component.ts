import {Component, OnInit} from '@angular/core';
import {HttpService} from '../http.service';
import * as L from 'leaflet';
import Chart from 'chart.js';

export class ImgPaths {
  CH4 = {
    NY: ['ny_CH4_2020-01-20.png', 'ny_CH4_2020-02-19.png', 'ny_CH4_2020-03-20.png', 'ny_CH4_2020-04-20.png'],
    SP: ['sp_CH4_2020-01-20.png', 'sp_CH4_2020-02-19.png', 'sp_CH4_2020-03-20.png', 'sp_CH4_2020-04-20.png']
  };
  CO = {
    NY: ['ny_CO_2020-01-20.png', 'ny_CO_2020-02-19.png', 'ny_CO_2020-03-20.png', 'ny_CO_2020-04-20.png'],
    SP: ['sp_CO_2020-01-20.png', 'sp_CO_2020-02-19.png', 'sp_CO_2020-03-20.png', 'sp_CO_2020-04-20.png']
  };
  HCHO = {
    NY: ['ny_HCHO_2020-01-20.png', 'ny_HCHO_2020-02-19.png', 'ny_HCHO_2020-03-20.png', 'ny_HCHO_2020-04-20.png'],
    SP: ['sp_HCHO_2020-01-20.png', 'sp_HCHO_2020-02-19.png', 'sp_HCHO_2020-03-20.png', 'sp_HCHO_2020-04-20.png']
  };
  NIR = {
    NY: ['ny_nir_2020-01-20.png', 'ny_nir_2020-02-19.png', 'ny_nir_2020-03-20.png', 'ny_nir_2020-04-20.png'],
    SP: ['sp_nir_2020-01-20.png', 'sp_nir_2020-02-19.png', 'sp_nir_2020-03-20.png', 'sp_nir_2020-04-20.png']
  };
  NO2 = {
    NY: ['ny_NO2_2020-01-20.png', 'ny_NO2_2020-02-19.png', 'ny_NO2_2020-03-20.png', 'ny_NO2_2020-04-20.png'],
    SP: ['sp_NO2_2020-01-20.png', 'sp_NO2_2020-02-19.png', 'sp_NO2_2020-03-20.png', 'sp_NO2_2020-04-20.png']
  };
  SO2 = {
    NY: ['ny_SO2_2020-01-20.png', 'ny_SO2_2020-02-19.png', 'ny_SO2_2020-03-20.png', 'ny_SO2_2020-04-20.png'],
    SP: ['sp_SO2_2020-01-20.png', 'sp_SO2_2020-02-19.png', 'sp_SO2_2020-03-20.png', 'sp_SO2_2020-04-20.png']
  };
  TEMP = {
    NY: ['ny_temp_2020-01-20.png', 'ny_temp_2020-02-19.png', 'ny_temp_2020-03-20.png', 'ny_temp_2020-04-20.png'],
    SP: ['sp_temp_2020-01-20.png', 'sp_temp_2020-02-19.png', 'sp_temp_2020-03-20.png', 'sp_temp_2020-04-20.png']
  }
};

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
  public brCases: any;
  public info: any;

  public chart: any;
  public chart2: any;
  public chart3: any;

  public covidData: any;
  public mobData: any;
  public ecoData: any;
  public imgData: any;
  imageBoundsSP = [ [-25.74572, -53.19823],[-19.08022, -43.70304] ];
  imageBoundsNY = [ [40.49617, -79.76333],[45.01583, -71.85635] ];
  imageOverlays: any = {};
  imagePaths: ImgPaths = new ImgPaths();


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

    this.brCases = await this.http.get('assets/data/covid_estados_br.json')
    this.brStates = await this.http.get('assets/data/states_brazil.json')
    this.brStates = L.geoJSON(this.brStates,
      {
        style: (feature) => {
        return {
          // weight: 2,
          // opacity: 1,
          color: 'white',
          // dashArray: '3',
          fillOpacity: 0.5,
          fillColor: this.getColor(this.getCases(feature.properties.uf_05))}},
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: this.highlightFeature,
            mouseout: (e) => {
              this.brStates.resetStyle(e.target)
              this.info.update();
            }
          })
        }
      }

      ).addTo(this.map)

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = map => {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 500, 1000, 1500, 2000, 5000, 10000],
        labels = [];
        div.innerHTML += '<b>Covid19 Cases</b>'
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<div><i style="background:' + this.getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+ </div>');
      }

      return div;
    };

    legend.addTo(this.map);


    this.info = L.control();

    this.info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    this.info.update = (props) => {
      console.log(this)
      this.info._div.innerHTML = '<h4>Covid Total Cases (30/05)</h4>' + (props ?
        '<b> State: ' + props.nome_uf + '</b><br />' + props.regiao
        + '<br /><b>' + this.getCases(props.uf_05) +' cases <b>'
        : 'Hover over a state');
    };

    this.info.addTo(this.map);

    this.covidData =  await this.http.get('assets/data/covidData.json');
    this.mobData =  await this.http.get('assets/data/mobilityData.json');
    this.ecoData =  await this.http.get('assets/data/ecoData.json');
    this.imgData =  await this.http.get('assets/data/imageData.json');
    this.chartit();

    this.setImgLayers();

  }

  setImgLayers(){
    let base_path = 'assets/imgs/';
    let opts = {zIndex: 10000};
    this.imageOverlays = {
      CH4: {
        NY: L.imageOverlay(base_path+this.imagePaths.CH4.NY[3], this.imageBoundsNY, opts),
        SP: L.imageOverlay(base_path+this.imagePaths.CH4.SP[3], this.imageBoundsSP, opts)
      },
      CO: {
        NY: L.imageOverlay(base_path+this.imagePaths.CO.NY[3], this.imageBoundsNY, opts),
        SP: L.imageOverlay(base_path+this.imagePaths.CO.SP[3], this.imageBoundsSP, opts)
      },
      HCHO: {
        NY: L.imageOverlay(base_path+this.imagePaths.HCHO.NY[3], this.imageBoundsNY, opts),
        SP: L.imageOverlay(base_path+this.imagePaths.HCHO.SP[3], this.imageBoundsSP, opts)
      },
      NIR: {
        NY: L.imageOverlay(base_path+this.imagePaths.NIR.NY[3], this.imageBoundsNY, opts),
        SP: L.imageOverlay(base_path+this.imagePaths.NIR.SP[3], this.imageBoundsSP, opts)
      },
      NO2: {
        NY: L.imageOverlay(base_path+this.imagePaths.NO2.NY[3], this.imageBoundsNY, opts),
        SP: L.imageOverlay(base_path+this.imagePaths.NO2.SP[3], this.imageBoundsSP, opts)
      },
      SO2: {
        NY: L.imageOverlay(base_path+this.imagePaths.SO2.NY[3], this.imageBoundsNY, opts),
        SP: L.imageOverlay(base_path+this.imagePaths.SO2.SP[3], this.imageBoundsSP, opts)
      },
      TEMP: {
        NY: L.imageOverlay(base_path+this.imagePaths.TEMP.NY[3], this.imageBoundsNY, opts),
        SP: L.imageOverlay(base_path+this.imagePaths.TEMP.SP[3], this.imageBoundsSP, opts)
      }
    }

    let temp = {};
    for(let k in this.imageOverlays){
      let obj = this.imageOverlays[k];
      temp[k] = L.layerGroup([obj.NY, obj.SP]);
    }
    L.control.layers({}, temp).addTo(this.map);
    this.imgLegend();
  }

  changeImgDate(month){
    let base_path = 'assets/imgs/';
    for(let k in this.imageOverlays){
      let obj = this.imageOverlays[k];
      for(let j in obj){
        let imOv = obj[j];
        imOv.setUrl( base_path + this.imagePaths[k][j][month]  );
      }
    }
  }

  imgLegend(){
    let cols = ['#43F2AF', '#6BF589', '#93F764', '#BBFA3E', '#E4FD19', '#FFF100', '#FFC900', '#FFA100', '#FF7800', '#FF5000', '#FF2800', '#FF0000'];

    var legend = L.control({position: 'bottomleft'});

    legend.onAdd = () => {

      var div = L.DomUtil.create('div', 'img legend');
      div.innerHTML += '<div>Low</div>';
      for (let i of cols) {
        div.innerHTML += '<i style="background:' + i + '"></i> ';
      }
      div.innerHTML += '<div>High</div>';
      div.innerHTML += '<div><strong>Satellite Measures</strong></div>';
      return div;
    };

    legend.addTo(this.map);
  }

  chartit() {
    var color = Chart.helpers.color;
    var timeFormat = 'MM/DD/YYYY HH:mm';


    var covid_colors = ['#de2d26','#fc8d59','#000'];
    var mob_colors = ['#c2e699', '#78c679', '#31a354', '#006837'];
    let datasets = []

    for (let i = 0; i < 3; i++) {
      datasets.push(
        {
        label: this.covidData.datasets[i].label,
        borderColor: color(covid_colors[i]).rgbString(),
        backgroundColor: color(covid_colors[i]).rgbString(),
        fill: false,
        data: this.covidData.datasets[i].data,
        yAxisID: "y-axis-1",
        }
      )
    }

    for (let i = 0; i < 3; i++) {
      datasets.push(
        {
        label: this.mobData.datasets[i].label,
        borderColor: color(mob_colors[i]).rgbString(),
        backgroundColor: color(mob_colors[i]).rgbString(),
        fill: false,
        data: this.mobData.datasets[i].data,
        yAxisID: "y-axis-2",
        }
      )
    }

    let lineChartData = {
      labels: this.covidData.labels,
      datasets: datasets};


    this.chart = new Chart('canvas', {
      type: "line",
      data: lineChartData,
      options: {
        responsive: true,
        hoverMode: 'index',
        stacked: false,
        title: {
          display: true,
          text: 'Disease Spread and Social Mobility Changes - São Paulo State',
          fontSize : 25
        },
        legend : {
          labels:{
            fontSize : 18,
            boxWidth : 50
            }
          },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit:'week',
                }}],
          yAxes: [
            {
            type: "linear",
            position: "right",
            id: "y-axis-1",
            ticks: {fontColor: color('red').rgbString()}
            }, {
            type: "linear",
            position: "left",
            id: "y-axis-2",
            gridLines: {drawOnChartArea: false},
            ticks: {
              beginAtZero: false,
              min: -100,
              max: 50,
              fontColor: color('green').rgbString()
              }
            }
          ],
        }
      }
    });

    let imgdata_colors = ['#fc8d59','#0c2c84','#3288bd','#542788'];
    let imgdata_axis = ['y-ax-1','y-ax-2','y-ax-2','y-ax-2']

    let datasets2 = []
    for (let i = 0; i < 4; i++) {
      console.log(i)
      datasets2.push(
        {
        label: this.imgData.datasets[i].label,
        borderColor: color(imgdata_colors[i]).rgbString(),
        backgroundColor: color(imgdata_colors[i]).rgbString(),
        fill: false,
        data: this.imgData.datasets[i].data,
        yAxisID: imgdata_axis[i],
        }
      )
    }

    let lineChartData2 = {
      labels: this.imgData.labels,
      datasets: datasets2
      };

    this.chart2 = new Chart('canvas2', {
      type: "line",
      data: lineChartData2,
      options: {
        responsive: true,
        hoverMode: 'index',
        stacked: false,
        title: {
          display: true,
          text: 'Satellite Image Information - São Paulo State',
          fontSize : 25
        },
        legend : {
          labels:{
            fontSize : 18,
            boxWidth : 50
            }
          },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit:'month',
                }}],
          yAxes: [
            {
            position: "left",
            id: "y-ax-1",
            ticks: {fontColor: color(imgdata_colors[0]).rgbString()}
            },
            {
            type: "linear",
            position: "right",
            id: "y-ax-2",
            ticks: {fontColor: color(imgdata_colors[2]).rgbString()}
            },
          ],
        }
      }
    })

    let ecodata_colors = ['#de2d26','#fc8d59','#99d594','#3288bd','#542788'];
    let ecodata_axis = ['y-ax-1','y-ax-1','y-ax-2']
    let datasets3 = []

    for (let i = 0; i < 3; i++) {
      datasets3.push(
        {
        label: this.ecoData.datasets[i].label,
        borderColor: color(ecodata_colors[i]).rgbString(),
        backgroundColor: color(ecodata_colors[i]).rgbString(),
        fill: false,
        data: this.ecoData.datasets[i].data,
        yAxisID: ecodata_axis[i],
        }
      )
    }


    let lineChartData3 = {
      labels: this.ecoData.labels,
      datasets: datasets3
      };

    this.chart3 = new Chart('canvas3', {
      type: "line",
      data: lineChartData3,
      options: {
        responsive: true,
        hoverMode: 'index',
        stacked: false,
        title: {
          display: true,
          fontSize : 25,
          text: 'Historical Socio Economic Data - São Paulo State'
        },
        legend : {
          labels:{
            fontSize : 18,
            boxWidth : 50
            }
          },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit:'quarter',
                }}],
          yAxes: [
            {
            position: "left",
            id: "y-ax-1",
            ticks: {fontColor: color(ecodata_colors[0]).rgbString()}
            },
            {
              position: "right",
              id: "y-ax-2",
              ticks: {fontColor: color(ecodata_colors[2]).rgbString()}
              }
          ],
        }
      }
    })
  }

  getCases(state){
    return this.brCases[state]
  }

  getColor(d) {
    return d > 10000 ? '#99000d' :
      d > 5000 ? '#cb181d' :
        d > 2000 ? '#ef3b2c' :
          d > 1500 ? '#fb6a4a' :
            d > 1000 ? '#fc9272' :
              d > 500 ? '#fcbba1' :
                  '#fee5d9';
  }

  highlightFeature = (e) => {
    var layer = e.target;

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.1
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
    console.log(layer.feature.properties.uf_05)
    this.info.update(layer.feature.properties)
  }

  toTop() {
    window.scroll(0,0);
  }
}




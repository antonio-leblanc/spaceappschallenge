var rois = [BR]; //[sp,ny,swe,ger,jpn];
var roi_names = ['BR']; //['sp','ny','swe','ger','jpn'];

var products = [
  {info: 'SO2',  product: 'COPERNICUS/S5P/OFFL/L3_SO2', bands: 'SO2_column_number_density'},
  {info: 'NO2',  product: 'COPERNICUS/S5P/OFFL/L3_NO2', bands: 'NO2_column_number_density'},
  {info: 'CO',   product: 'COPERNICUS/S5P/OFFL/L3_CO', bands: 'CO_column_number_density'},
  {info: 'CH4',  product: 'COPERNICUS/S5P/OFFL/L3_CH4', bands: 'CH4_column_volume_mixing_ratio_dry_air'},
  {info: 'HCHO', product: 'COPERNICUS/S5P/OFFL/L3_HCHO', bands: 'tropospheric_HCHO_column_number_density'},
  {info: 'temp', product: 'MODIS/006/MOD11A1', bands: 'LST_Day_1km'},
  {info: 'nir',  product: 'COPERNICUS/S2_SR', bands: 'B8'},
  //{info: 'light', product: 'NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG', bands: 'avg_rad'}
];

var date_pairs = [
  ['2020-01-01', '2020-01-07'],
  ['2020-01-08', '2020-01-14'],
  ['2020-01-15', '2020-01-21'],
  ['2020-01-22', '2020-01-28'],
  ['2020-01-29', '2020-02-04'],
  ['2020-02-05', '2020-02-11'],
  ['2020-02-12', '2020-02-18'],
  ['2020-02-19', '2020-02-25'],
  ['2020-02-26', '2020-03-03'],
  ['2020-03-04', '2020-03-10'],
  ['2020-03-11', '2020-03-17'],
  ['2020-03-18', '2020-03-24'],
  ['2020-03-25', '2020-03-31'],
  ['2020-04-01', '2020-04-07'],
  ['2020-04-08', '2020-04-14'],
  ['2020-04-15', '2020-04-21'],
  ['2020-04-22', '2020-04-28'],
  ['2020-04-29', '2020-05-05']
];

for(var i = 0; i < rois.length; i++){
  for(var j = 0; j < products.length; j++){
    for(var k = 0; k < date_pairs.length; k++){
      
      var roi = rois[i];
      var prod = products[j];
      var dates = date_pairs[k];
      
      var collection = ee.ImageCollection(prod.product)
        .filterDate(dates[0], dates[1])
        .select(prod.bands);
      
      var img = collection.mean();
      
      //var scale = img.projection().nominalScale().getInfo();

      var file_name = roi_names[i] + '_' + prod.info + '_' + dates[0] + "_" + dates[1];
      
      Export.image.toDrive({
        image: img,
        description: file_name,
        //scale: scale,
        region: roi,
        folder: 'NASA_space_apps',
        skipEmptyTiles: true
      });
    }
  }
}

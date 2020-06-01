library(leaflet)
library(raster)

colors = lidR:::height.colors(20)
sp_border = 'borders/SP.shp' %>% shapefile
ny_border = 'borders/NY.shp' %>% shapefile

uimgs = dir('GEE/') %>% sub(pattern = '^(.+_.+?)_.+', replacement = '\\1') %>% unique %>% sort
for(pref in uimgs){
  imgs = dir('GEE/', '^' %>% paste0(pref), full.names = T) %>% sort
  dates = sub('.+(2020_.+)\\.tif', '\\1', imgs) %>% as.Date(tryFormats='%Y_%m_%d')
  imgs %<>% sapply(raster)
  
  if(length(imgs) == 12){
    imgs = list(
      imgs[1:3] %>% stack %>% stackApply(1, mean),
      imgs[4:6] %>% stack %>% stackApply(1, mean),
      imgs[7:9] %>% stack %>% stackApply(1, mean),
      imgs[10:12] %>% stack %>% stackApply(1, mean)
    )
    dates = c(
      mean(dates[1:3]),
      mean(dates[4:6]),
      mean(dates[7:9]),
      mean(dates[10:12])
    )
  }
  
  border = if(grepl('^sp', pref)) sp_border else ny_border
  
  for(i in 1:length(imgs)){
    img = mask(imgs[[i]], border)
    if( img %>% values %>% is.na %>% all ) next
    temp = values(img)
    qts = quantile(temp, c(.025,.975), na.rm=T) %>% as.double
    temp[temp < qts[1] || temp > qts[2]] = NA
    values(img) = temp
    valcolors = lidR:::set.colors(values(img), lidR::height.colors(20))
    rgb_data <- col2rgb(valcolors, alpha = TRUE)
    raw_data <- as.raw(rgb_data)
    dim(raw_data) <- c(4, ncol(img), nrow(img))
    png_name = paste0('pngs/', pref, '_', dates[i], '.png')
    png::writePNG(raw_data, png_name)
  }
}


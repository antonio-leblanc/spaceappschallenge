setwd('~/Desktop/nasa space apps COVID/')

require(raster)
require(magrittr)

sp_border = 'borders/SP.shp' %>% shapefile
ny_border = 'borders/NY.shp' %>% shapefile
  
infos = list()

par(mfrow=c(2,4))
uimgs = dir('GEE/') %>% sub(pattern = '^(.+_.+?)_.+', replacement = '\\1') %>% unique %>% sort
for(pref in uimgs){
  imgs = dir('GEE/', '^' %>% paste0(pref), full.names = T) %>% sort
  dates = sub('.+(2020_.+)\\.tif', '\\1', imgs) %>% as.Date(tryFormats='%Y_%m_%d')
  imgs %<>% sapply(raster)

  border = if(grepl('^sp', pref)) sp_border else ny_border

  vals = c()
  for(i in imgs){
    img = mask(i, border)
    temp = values(img)
    # temp = (temp - min(temp, na.rm=T)) / (max(temp, na.rm=T) - min(temp, na.rm=T))
    values(img) = temp
    vals %<>% c(mean(temp, na.rm = T))
  }
  plot(vals ~ dates, main=pref, pch=20, col='black', cex=2, xlab='Time (10 days intervals)', ylab='')#, ylim=c(0,1))
  infos[[pref]] = data.frame(dates=dates, means=vals)
}


setwd('~/Desktop/nasa space apps COVID/')

require(raster)
require(magrittr)

sp_border = 'borders/SP.shp' %>% shapefile
sp_roads = 'borders/SP_roads_b5.shp' %>% shapefile

ny_border = 'borders/NY.shp' %>% shapefile
ny_roads = 'borders/NY_roads_b5.shp' %>% shapefile

par(mfrow=c(2,4))
uimgs = dir('GEE/') %>% sub(pattern = '^(.+_.+?)_.+', replacement = '\\1') %>% unique %>% sort
for(pref in uimgs){
  imgs = dir('GEE/', '^' %>% paste0(pref), full.names = T) %>% sort
  dates = sub('.+(2020_.+)\\.tif', '\\1', imgs) %>% as.Date(tryFormats='%Y_%m_%d')
  imgs %<>% sapply(raster)
  # if(length(imgs) < 12) next
  
  if(length(imgs) == 12 && FALSE){
    stacks = list(
      # imgs[1:3] %>% stack %>% stackApply(1, mean),
      imgs[4:6] %>% stack %>% stackApply(1, mean),
      imgs[7:9] %>% stack %>% stackApply(1, mean),
      imgs[10:12] %>% stack %>% stackApply(1, mean)
    )
    writeRaster(stacks %>% stack, pref %>% paste0('.tif'))
  }
  
  if(grepl('^sp', pref)){
    border = sp_border
    roads = sp_roads
    covid = read.csv('merged_sp.csv')
    cdt = as.Date(covid$X, tryFormats = c("%m/%d/%Y"))
    covid = covid$casosAcumulado
  }else{
    border = ny_border
    roads = ny_roads
    covid = read.csv('merged_ny.csv')
    cdt = as.Date(covid$X, tryFormats = c("%Y-%m-%d"))
    covid = covid$Total.Cases
  }
  
  base = focal(imgs[[1]], rep(1,9) %>% matrix(ncol=3), mean, na.rm=T) %>% 
    values %>% mean(na.rm=T)
  
  # imgs = imgs[-1]
  
  vals = c()
  sd_vals = c()
  road_vals = c()  
  sd_roads = c()
  for(i in imgs){
    i = focal(i, rep(1,9) %>% matrix(ncol=3), mean, na.rm=T)
    img = mask(i, border)
    temp = values(img)
    qts = quantile(temp, c(.025,.975), na.rm=T)
    temp[temp < qts[1] || temp > qts[2]] = NA
    # temp = (temp - min(temp, na.rm=T)) / (max(temp, na.rm=T) - min(temp, na.rm=T))
    values(img) = temp
    vals %<>% c(mean(temp, na.rm = T))
    # sd_vals %<>% c(sd(temp, na.rm = T))
    
    # img = mask(img, roads)
    # temp = mean(values(img), na.rm = T)
    # road_vals %<>% c(mean(values(img), na.rm = T))
    # sd_roads %<>% c(sd(values(img), na.rm = T))
  }
  plot(vals ~ dates, main=pref, pch=20, col='black', cex=2, xlab='Time (10 days intervals)', ylab='')#, ylim=c(0,1))
  if(length(vals) > 1) abline(lm(vals ~ dates), col='red')
  par(new=T)
  plot(covid ~ cdt, col='orange', lwd=2, type='l', axes=F, ylab='', xlab='')
  # for(i in 1:length(vals)) arrows(i,vals[i]-sd_vals[i],i,vals[i]+sd_vals[i],length=0, col='blue')
  # points(road_vals, pch=20, col='red', cex=2)
  # for(i in 1:length(sd_vals)) arrows(i,road_vals[i]-sd_roads[i],i,road_vals[i]+sd_roads[i],length=0, col='red')
  # lines(road_vals, lwd=2, col='red')
}

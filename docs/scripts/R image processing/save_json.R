json = list(
  labels = infos$ny_CH4$dates,
  datasets = list(
    list(
      label = "NY - Average CH4",
      data = infos$ny_CH4$means
    ),
    list(
      label = "NY - Average CO",
      data = infos$ny_CO$means
    ),
    list(
      label = "NY - Average HCCO",
      data = infos$ny_HCHO$means
    ),
    list(
      label = "NY - Average Near Infra Red (NIR) reflectance",
      data = infos$ny_nir$means
    ),
    list(
      label = "NY - Average NO2",
      data = infos$ny_NO2$means
    ),
    list(
      label = "NY - Average SO2",
      data = infos$ny_SO2$means
    ),
    list(
      label = "NY - Average Temperature",
      data = infos$ny_temp$means
    ),
    list(
      label = "SP - Average CH4",
      data = infos$sp_CH4$means
    ),
    list(
      label = "SP - Average CO",
      data = infos$sp_CO$means
    ),
    list(
      label = "SP - Average HCCO",
      data = infos$sp_HCHO$means
    ),
    list(
      label = "SP - Average Near Infra Red (NIR) reflectance",
      data = infos$sp_nir$means
    ),
    list(
      label = "SP - Average NO2",
      data = infos$sp_NO2$means
    ),
    list(
      label = "SP - Average SO2",
      data = infos$sp_SO2$means
    ),
    list(
      label = "SP - Average Temperature",
      data = infos$sp_temp$means
    )
  )
)

a = jsonlite::toJSON(json, auto_unbox = T, digits = NA)
write(a, 'a.json')

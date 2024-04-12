require 'httparty'
require_relative '../../app/models/feature.rb'

namespace :data do
  desc "Obtener y persistir datos sísmicos"
  task fetch_sismic_data: :environment do
    response = HTTParty.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson")

    if response.success?
      data = JSON.parse(response.body)
      features_data = data["features"]

      features_data.each do |feature_data|
        properties = feature_data["properties"]
        geometry = feature_data["geometry"]["coordinates"]

        # Validar que los datos no sean nulos y cumplan los rangos requeridos
        next if properties["title"].blank? || properties["url"].blank? || properties["place"].blank? || properties["magType"].blank? || geometry.blank?
        next if properties["mag"] < -1.0 || properties["mag"] > 10.0 || geometry[1] < -90.0 || geometry[1] > 90.0 || geometry[0] < -180.0 || geometry[0] > 180.0

        # Validar que no se dupliquen los registros
        unless Feature.exists?(longitude: geometry[0], latitude: geometry[1])
          Feature.create!(
            external_id: properties["id"],
            magnitude: properties["mag"],
            place: properties["place"],
            time: Time.at(properties["time"] / 1000), 
            url: properties["url"],
            tsunami: properties["tsunami"],
            mag_type: properties["magType"],
            title: properties["title"],
            longitude: geometry[0],
            latitude: geometry[1]
          )
        end
      end

      puts "Datos sísmicos obtenidos y persistidos correctamente."
    else
      puts "Error al obtener datos sísmicos: #{response.code}"
    end

  end
end
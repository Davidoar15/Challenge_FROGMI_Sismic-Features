require_relative '../models/feature.rb'
require_relative '../models/comment.rb'

class FeaturesController < ApplicationController
  def index
    features = Feature.all

    # Filtrar por mag_type si está presente
    if params[:filters].present? && params[:filters][:mag_type].present?
      mag_types = params[:filters][:mag_type].split(',')
      features = features.where(mag_type: mag_types)
    end

    # Manejar la paginación
    per_page = params[:per_page].present? ? params[:per_page].to_i : 25 
    per_page = [per_page, 1000].min # Limitar per_page a un máximo de 1000
    page = params[:page].present? ? params[:page].to_i : 1
    total = features.count
    features = features.limit(per_page).offset((page - 1) * per_page)

    response = {
      data: features.map { |feature| serialize_features(feature) },
      pagination: {
        current_page: page,
        total: total,
        per_page: per_page
      }
    }

    render json: response
  end

  def show 
    feature = Feature.find(params[:feature_id])
    comments = Comment.where(feature_id: feature[:id])

    feature_data = serialize_feature(feature, comments)

    render json: { data: feature_data }, status: :ok
    
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Feature not Found" }, status: :not_found
  end

  private
  def serialize_features(feature)
    {
      id: feature.id,
      type: "feature",
      attributes: {
        external_id: feature.external_id,
        magnitude: feature.magnitude,
        place: feature.place,
        time: feature.time.to_s,
        tsunami: feature.tsunami,
        mag_type: feature.mag_type,
        title: feature.title,
        coordinates: {
          longitude: feature.longitude,
          latitude: feature.latitude
        }
      },
      links: {
        external_url: feature.url
      }
    }
  end

  def serialize_feature(feature, comments)
    {
      id: feature.id,
      attributes: {
        magnitude: feature.magnitude,
        mag_type: feature.mag_type,
        title: feature.title,
        coordinates: {
          longitude: feature.longitude,
          latitude: feature.latitude
        }
      },
      comments: comments.map { |comment| serialize_comment(comment) }
    }
  end

  def serialize_comment(comment)
    {
      body: comment.body
    }
  end
end
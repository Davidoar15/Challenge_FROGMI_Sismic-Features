require_relative '../models/feature.rb'

class CommentsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :find_feature

  # POST. Crear un Comment relacionado a una Feature por su ID 
  def create
    @comment = @feature.comments.build(comment_params)
    if @comment.save
      render json: @comment, status: :created
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def find_feature
    @feature = Feature.find(params[:feature_id])
  end

  def comment_params
    params.require(:comment).permit(:body)
  end 
end

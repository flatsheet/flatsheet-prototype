class SheetsController < ApplicationController
  before_action :set_sheet, only: [:show, :edit, :update, :destroy]
  before_action :authenticate, only: [:create, :update, :destroy]

  # GET /sheets
  def index
    user = current_user || User.friendly.find(params[:username])
    @sheets = user.sheets
  end

  # GET /sheets/:id
  def show
  end

  # POST /import-file
  def import_file
    if user_signed_in?
      sheet = params[:sheet] || Sheet.new({
        name: 'A new sheet!', 
        description: 'Enter a sheet description!',
        user: current_user
      })
      Sheet.import_file(params[:file], sheet)
      redirect_to root_path
    else
      redirect_to root_path
    end
  end

  # POST /sheets
  # POST /sheets.json
  def create
    @sheet = Sheet.new(sheet_params)
    @sheet.user = current_user || @user

    respond_to do |format|
      if @sheet.save
        format.html { redirect_to @sheet, notice: 'Sheet was successfully created.' }
        format.json { render action: 'show', status: :created, location: @sheet }
      else
        format.html { render action: 'new' }
        format.json { render json: @sheet.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /sheets/1
  # PATCH/PUT /sheets/1.json
  def update
    respond_to do |format|
      if @sheet.update(sheet_params)
        format.html { redirect_to @sheet, notice: 'Sheet was successfully updated.' }
        format.json { render json: @sheet }
      else
        format.html { render action: 'edit' }
        format.json { render json: @sheet.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /sheets/1
  # DELETE /sheets/1.json
  def destroy
    @sheet.destroy
    respond_to do |format|
      format.html { redirect_to sheets_url }
      format.json { head :no_content }
    end
  end

  private

    def authenticate
      current_user || authenticate_token || render_unauthorized
    end

    def authenticate_token
      authenticate_with_http_token do |token, options|
        @user = User.find_by(api_key: token)
      end
    end

    def render_unauthorized
      self.headers['WWW-Authenticate'] = 'Token realm="Application"'
      render json: 'Bad credentials. Log in to see sheets.', status: 401
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_sheet
      @sheet = Sheet.friendly.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def sheet_params
      params.require(:sheet).permit(:name, :description, :rows)
    end
end

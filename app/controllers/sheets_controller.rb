class SheetsController < ApplicationController
  before_action :set_sheet, only: [:show, :edit, :update, :destroy]

  # GET /sheets
  # GET /sheets.json
  def index
    @sheets = Sheet.user_sheets(current_user)
  end

  # GET /sheets/1
  # GET /sheets/1.json
  def show
  end

  # GET /sheets/new
  def new
    @sheet = Sheet.new
  end

  # GET /sheets/1/edit
  def edit
  end

  def import_file
    sheet = params[:sheet] || Sheet.new({
      name: 'A new sheet!', 
      description: 'Enter a sheet description!',
      user: current_user
    })
    Sheet.import_file(params[:file], sheet)
    redirect_to root_path
  end

  # POST /sheets
  # POST /sheets.json
  def create
    @sheet = Sheet.new(sheet_params)

    # TODO: fix this nasty hack
    # i don't know why the rows parameter is isn;t permitted
    # so i'm grabbing it from params, which seems ugly
    @sheet[:rows] = params[:sheet][:rows]
    @sheet.user = current_user

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

      # TODO: fix this nasty hack
      # i don't know why the rows parameter is isn;t permitted
      # so i'm grabbing it from params, which seems ugly
      data = sheet_params
      data[:rows] = params[:sheet][:rows]
      
      if @sheet.update(data)
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
    # Use callbacks to share common setup or constraints between actions.
    def set_sheet
      @sheet = Sheet.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def sheet_params
      params.require(:sheet).permit(:name, :description, :rows)
    end
end

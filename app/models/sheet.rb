class Sheet < ActiveRecord::Base
  belongs_to :user

  def self.user_sheets(u)
    where(:user_id => u.id)
  end

  def self.import_google_spreadsheet(key)
    s = Roo::Google.new(key)
  end

  def self.import_file(file, sheet)
    if File.extname(file.original_filename) == '.json'
      file = File.new(file.path)
      sheet['rows'] = JSON.parse file.read
    else
      sheet['rows'] = []
      spreadsheet = open_spreadsheet(file)
      header = spreadsheet.row(1)
      (2..spreadsheet.last_row).each do |i|
        row = Hash[[header, spreadsheet.row(i)].transpose]
        puts "\n\n\n***************\n"
        puts row
        puts "\n\n\n***************\n"
        sheet['rows'].push(row)
      end
    end
    sheet.save
  end

  def self.open_spreadsheet(file)
    case File.extname(file.original_filename)
      when ".csv" then Roo::CSV.new(file.path) 
      when ".xls" then Roo::Excel.new(file.path)
      when ".xlsx" then Roo::Excelx.new(file.path)
      when ".ods" then Roo::OpenOffice.new(file.path)
      else raise "Unknown file type: #{file.original_filename}" 
    end
  end

end

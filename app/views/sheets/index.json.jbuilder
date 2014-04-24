json.array!(@sheets) do |sheet|
  json.extract! sheet, :id, :slug, :name, :description
  json.url sheet_url(sheet, format: :json)
end

var Backbone = require('backbone');
var $ = Backbone.$ = window.$;
var _ = require('underscore');
var d3 = require('d3');
var metatable = require('d3-metatable');

/* use {{ }} and {{= }} in templates */
_.templateSettings = {
  interpolate: /\{\{\=(.+?)\}\}/g,
  evaluate: /\{\{(.+?)\}\}/g
};

Backbone.old_sync = Backbone.sync
Backbone.sync = function(method, model, options) {
  var new_options =  _.extend({
    beforeSend: function(xhr) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    }
  }, options)
  return Backbone.old_sync(method, model, new_options);
};

var Sheet = Backbone.Model.extend({
  defaults: {
    name: 'A new sheet!',
    description: 'Describe your sheet here.',
    rows: [{ 'sample column': 'rename this column to get started!' }]
  },
  urlRoot: '/sheets',
  toJSON: function() {
    return { sheet: _.clone( this.attributes ) }
  },
});

var SheetCollection = Backbone.Collection.extend({
  url: '/sheets',
  model: Sheet
});

var SheetListView = Backbone.View.extend({
  tagName: 'div',
  id: 'sheet-list',

  initialize: function(){
    var self = this;
    this.sheets = new SheetCollection();
    this.sheets.fetch({ 
      success: function(){
        self.render();
      }
    });
  },

  appendSheet: function(sheet){
    var s = new SheetListItemView({
      model: sheet
    });
    this.$el.append(s.render().el);
  },

  render: function(){
    var self = this;
    var importForm = _.template( $('#import-form-template').html() );
    $('#main').html(importForm);
    $('#main').append(this.el);
    this.sheets.each(function(sheet){
      self.appendSheet(sheet);
    });
  }
});

var SheetListItemView = Backbone.View.extend({
  tagName: 'div',
  className: 'sheet-list-item',

  initialize: function(){
    this.template = _.template( $('#sheet-list-item-template').html() );
  },

  render: function(){
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});

var SheetDetailView = Backbone.View.extend({
  tagName: 'div',
  className: 'sheet-detail-wrapper',

  initialize: function(sheet){
    var self = this;
    this.template = _.template( $('#sheet-detail-template').html() );

    if (this.model.get('id')){
      this.model.fetch({
        success: function(){
          self.render();
        }
      });
    } else {
      this.render();
    }
  },

  events: {
    'click .save': 'save',
    'click .add-row': 'addRow',
    'click .expand': 'expand'
  },

  save: function(e){
    if (e) e.preventDefault();

    var attrs = {
      name: $('.sheet-name').val(),
      description: $('.sheet-description').val(),
      rows: this.model.get('rows')
    };

    var opts = {
      success: function(model){
        if (location.hash == '#new') location.hash = 'sheet-' + model.get('id');
      }
    };

    this.model.save(attrs, opts);

    return false;
  },

  addRow: function(e){
    e.preventDefault();

    var rows = this.model.get('rows');
    rows.push({});
    this.model.set({ rows: rows });
    this.renderRows();

    return false;
  },

  expand: function(e){
    var $input = $(e.target).parent().parent().find('input');
    var editor = new CellEditor($input, this, e.target);
  },

  renderRows: function(){
    var self = this;
    var rows = this.model.get('rows');
    var container = d3.select('.sheet-rows');
    container.html('');
    container.append('div')
      .data([rows])
      .call(
        metatable(d3)
          .on('change', function(row, i) {
            rows[i] = row;
            self.model.set({ rows: rows });
            var p = self.model.get('rows')
            console.log('change happened')
          })
          .on('rowfocus', function(row, i) {

          })
      );

    $('.controls').append('<a href="#" class="add-row button">New row</a>');
    $('.controls').append('<a href="#" class="save button">Save</a>');

    if (this.model.get('id')){
      var endpoint = document.createElement('a');
      endpoint.innerHTML = 'API endpoint for this sheet';
      endpoint.href = '/sheets/' + this.model.get('id');
      endpoint.target = '_blank';
      endpoint.className = 'api-endpoint';
      $('.controls').append(endpoint);
    }
  },

  render: function(){
    var html = $(this.el).html(this.template(this.model.toJSON()));
    $('#main').html(html);
    this.renderRows();
    return this;
  }
});

var CellEditor = Backbone.View.extend({
  tagName: 'div',
  className: 'cell-editor',

  initialize: function($input, detailView, target){
    this.$input = $input;
    this.detailView = detailView;

    var parent = target.parentNode.parentNode;
    this.inputEl = parent.firstElementChild;
    console.log(parent, this.inputEl)
    this.template = _.template( $('#cell-editor-template').html() );
    this.render();
  },

  events: {
    'click .update': 'update'
  },

  update: function(e){
    var text = $(e.target).parent().find('textarea').val();
    this.$input.val(text);
    this.$input.trigger('change');
    
    var event = new Event('change');
    this.inputEl.addEventListener('change', function (e) {}, false);
    this.inputEl.dispatchEvent(event);
    this.detailView.save();

    this.$el.remove();
  },

  render: function($input){
    var html = this.template({ text: this.$input.val(), field: this.$input.attr('field') });
    $('body').append(this.$el.html(html));
  }
});

var Router = Backbone.Router.extend({
  routes: {
    '': 'sheetList',
    'new': 'newSheet',
    'sheet-:id': 'sheetDetail'
  },

  initialize: function(){},

  sheetList: function(){
    new SheetListView();
  },

  newSheet: function(){
    new SheetDetailView({
      model: new Sheet()
    });
  },

  sheetDetail: function(id){
    new SheetDetailView({
      model: new Sheet({ id: id })
    });
  }
});

$(function(){
  var app = new Router();
  Backbone.history.start();
});

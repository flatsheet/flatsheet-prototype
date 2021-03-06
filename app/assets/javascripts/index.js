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
  urlRoot: '/api/v1/sheets',
  idAttribute: 'slug',
  toJSON: function() {
    var sheet = _.clone( this.attributes );
    sheet.rows = JSON.stringify(sheet.rows);
    return { sheet: sheet };
  },
});

var SheetCollection = Backbone.Collection.extend({
  url: '/api/v1/sheets',
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

    this.model.fetch({
      data: $.param({ id: this.id }),
      success: function(a, b){
        self.render();
        console.log(a, b)
      }
    });
  },

  events: {
    'click .sheet-public-view': 'check',
    'click .save': 'save',
    'click .add-row': 'addRow',
    'click .delete-row': 'deleteRow',
    'click .expand': 'expand'
  },

  check: function(e){
    var checked = $(e.currentTarget).prop('checked');
    this.model.set('public_view', checked);
    this.save();
  },

  save: function(e){
    if (e) e.preventDefault();

    var saveBtn = $('a.save');
    saveBtn.text('Saving');

    var attrs = {
      name: $('.sheet-name').val(),
      description: $('.sheet-description').val(),
      rows: this.model.get('rows')
    };

    var opts = {
      success: function(model){
        setTimeout(function(){
          saveBtn.text('Save');
        }, 400); 

        if (location.hash == '#new') location.hash = '#' + model.get('slug');
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

    var $row = $('.sheet-rows tbody tr:last');

    $('html, body').animate({
      scrollTop: $row.offset().top
    }, 1000);

    return false;
  },

  deleteRow: function(e){
    if (confirm('Are you sure you want to delete this row?')){
      var rows = this.model.get('rows');
      var $rowEls = $('.sheet-rows tbody tr');
      var $button = $(e.target);
      var i = $button.parent().index();
      console.log(i)
      $rowEls[i].remove();
      rows.splice(i, 1);
      $button.parent().remove();
      this.model.set({ rows: rows });
      this.save();      
    }
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
            var p = self.model.get('rows');
            self.save();
          })
          .on('rowfocus', function(row, i) {

          })
      );

    $('.sheet-row-controls ul').html('');
    for (var i=0; i<rows.length; i++) {
      $('.sheet-row-controls ul').append('<li><i class="fa fa-times delete-row"></i></li>');
    }

    if (this.model.get('slug')){
      var endpoint = document.createElement('a');
      endpoint.innerHTML = 'API endpoint for this sheet';
      endpoint.href = '/api/v1/sheets/' + this.model.get('slug');
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
    this.template = _.template( $('#cell-editor-template').html() );
    this.render();
  },

  events: {
    'click .update': 'update',
    'click .close-editor': 'update'
  },

  update: function(e){
    var text = $(e.target).parent().find('textarea').val();
    this.$input.val(text);
    this.$input.trigger('change');
    
    var event = new Event('change');
    this.inputEl.addEventListener('change', function (e) {}, false);
    this.inputEl.dispatchEvent(event);
    this.detailView.save();
    this.detailView.renderRows();
    this.$el.remove();
  },

  render: function($input){
    var html = this.template({ text: this.$input.val(), field: this.$input.attr('field') });
    $('body').append(this.$el.html(html));
    $('#textarea').focus();
  }
});

var Router = Backbone.Router.extend({
  routes: {
    '': 'sheetList',
    'new': 'newSheet',
    'sheet/:slug': 'sheetDetail'
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

  sheetDetail: function(slug){
    new SheetDetailView({
      model: new Sheet({ slug: slug })
    });
  }
});

$(function(){
  var slug = window.location.pathname.split('/sheet/')[1];
  if (slug) {
    new SheetDetailView({
      model: new Sheet({ slug: slug })
    });
  } else {
    var app = new Router();
    Backbone.history.start();
  }
});

define([
	"app",
	"lodash",
	"backbone",
	"models/typeface",
	"plugins/backbone.paginator",
	"plugins/backbone.localStorage"
	// "plugins/underscore.string"
],

function( app, _, Backbone, Typeface, Paginator, localStorage, _str ){

	// Currently a hack till I figure out how to get
	// underscore.string property imported
	var escapeChars = {
			lt: '<',
			gt: '>',
			quot: '"',
			apos: "'",
			amp: '&'
		},
		reversedEscapeChars = {};

	for(var key in escapeChars){
		reversedEscapeChars[escapeChars[key]] = key;
	};

	var Typefaces = Paginator.clientPager.extend({

		url: 'http://use.edgefonts.net/',
		model : Typeface,

		localStorage : new Backbone.LocalStorage('font_favorites'),

		useLevenshteinPlugin : true,

		paginator_ui : {
			firstPage : 1,
			currentPage : 1,
			perPage : 10,
			pagesInRange : 10
		},

		// Map Adobe's nomenclature to undertandable names
		variantMap : {
			'n1' : 'Thin',
			'n2' : 'Extra Light',
			'n3' : 'Light',
			'n4' : 'Regular',
			'n5' : 'Medium',
			'n6' : 'Semibold',
			'n7' : 'Bold',
			'n8' : 'Heavy',
			'n9' : 'Black',
			'i1' : 'Thin Italic',
			'i2' : 'Extra Light Italic',
			'i3' : 'Light Italic',
			'i4' : 'Italic',
			'i5' : 'Medium Italic',
			'i6' : 'Semibold Italic',
			'i7' : 'Bold Italic',
			'i8' : 'Heavy Italic',
			'i9' : 'Black Italic'
		},

		initialize : function(){
			Paginator.clientPager.prototype.initialize.apply( this, Array.prototype.slice.call(arguments) );
			this.on( "change:favorite", this.saveFavorites, this );
		},

		initializePagination : function( page ){
			this.firstPage = 1;
			this.totalPages = Math.ceil( this.length / this.paginator_ui.perPage );
			this.currentPage = page || 1;
			this.pager();
		},

		updatePagination : function( perPage ){
			this.howManyPer( perPage );
			_.extend(this, _.pick( this.info(), _.keys(this.paginator_ui) ) );
		},

		clearFieldFilter : function(){
			this.lastFieldFilterRiles = [];
			this.fieldFilterRules = [];
			this.pager();
		},

		parse : function( response ){
			return response;
		},

		saveFavorites : function(){
			this.each(function( model ){
				if( model.isFavorite() ){
					model.save();
				}
			});
		},

		getFavorites : function(){
			return _.filter( this.origModels, function( model ){
				return model.isFavorite();
			}, this);
		},

		setPreviewText : function( text ){
			var attrs = {
				'preview_text': this.escapeHTML( text )
			};

			this.invoke('set', attrs);

			if( this.origModels ){
				_.invoke( this.origModels, 'set', attrs );
			}
		},

		setFontSize : function( size ){
			this.invoke('set', { font_size: size });

			if( this.origModels ){
				_.invoke( this.origModels, 'set', { font_size : size });
			}
		},

		// Stolen from underscore.string for input sanitization
		escapeHTML: function( str ) {
			if (str == null) return '';
			return String(str).replace(/[&<>"']/g, function(m){ return '&' + reversedEscapeChars[m] + ';'; });
		}
	});

	return Typefaces;
});

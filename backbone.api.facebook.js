// Assuming that Facebook JS lib is loaded...
(function(_, Backbone) {
	
	// Fallbacks
	APP = window.APP || (APP = { Models: {}, Collections: {}, Views: {} });
	if( _.isUndefined(Backbone.API) ) Backbone.API = {};
	// 
	APP.Facebook = {};
	
	Backbone.API.Facebook = Backbone.Collection.extend({
		fetch : function(method, model, options) {
			var self = this;
			FB.getLoginStatus(function(response){
				if( response.status == "connected" ){
					// continue with request
					Backbone.Collection.prototype.fetch.call( self );
				}
				// else try to FB.Login?
			});
		}, 
		sync : function(method, model, options) {
			
			var url = (this.url instanceof Function) ? this.url() : this.url;
			
			FB.api(url, function( response ) {
				// save response.paging for later?
				// send just the response.data:
				var data = response.data || response;
				options.success( data );
			});
			
		},
		parse : function( response ){
			//is uid always the id? apparently...
			var data = _.map(response, function( result ){
				if( result.uid ){
					result.id = result.uid;
					delete result.uid;
				}
				return result;
			});
			return data;
		}
	});
	
	Backbone.API.Facebook.Models = {};
	
	Backbone.API.Facebook.Models.User = Backbone.Model.extend({
		defaults : {
			//installed : true
		}
	});
	
	Backbone.API.Facebook.Models.Feed = Backbone.Model.extend({
		defaults : {
			//installed : true
		}
	});
	
	
	// Application interaction...
	
	APP.Facebook.Friends = Backbone.API.Facebook.extend({
		model : Backbone.API.Facebook.Models.User,
		url: function(){
			return {
				method: 'fql.query',
				query: 'Select name, uid from user where is_app_user = 1 and uid in (select uid2 from friend where uid1 = me()) order by concat(first_name,last_name) asc'
			}
		}, 
		initialize: function( model, options){
			// auto-fetch if requested...
			if( options.fetch ){ 
				this.fetch();
			}
		}
	});

	APP.Facebook.Feed = Backbone.API.Facebook.extend({
		model : Backbone.API.Facebook.Models.Feed,
		url: function(){
			return "/me/feed"; 
		}, 
		initialize: function( model, options){
			
			// parameters
			this.num = options.num || 10;
			// auto-fetch if requested...
			if( options.fetch ){ 
				this.fetch();
			}
		}
	});
	

})(this._, this.Backbone);
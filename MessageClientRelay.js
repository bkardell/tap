var XDomainMessageClient = (function (window) {
	var RSVP = window.RSVP;
	RSVP.all = function ( promises ) {
		var i, results = [];
		var allPromise = new RSVP.Promise();
		var remaining = promises.length;

		var resolver = function ( index ) {
			return function( value ) {
				resolve( index, value );
			};
		};
		var resolve = function ( index, value ) {
			results[ index ] = value;
			if ( --remaining === 0 ) {
				allPromise.resolve( results );
			}
		};
		var reject = function ( error ) {
			allPromise.reject( error );
		};

		for ( i = 0; i < remaining; i++ ) {
			promises[ i ].then( resolver( i ), reject );
		}

		return allPromise;
	};
	var XDomainMessageClient = function (url) {
		var messageId = 0;
		var messages = {};
		var ready = [];
		var i;
		var relay;
		var self = this;
		var readyPromise = new RSVP.Promise();
		var getHandler = function (self, messageId, it){
			return function(){
				self.relay.postMessage({"id": messageId, "body": it }, "*");
			};
		};

		if (!url) {
			return null;
		}
		relay = window.frames[ url ];
		document.addEventListener("DOMContentLoaded", function (event) {
			if(!relay){
				temp = document.createElement('iframe');
				temp.setAttribute("name",url);
				temp.src = url;
				temp = document.body.appendChild(temp);
				temp.style.display = "none";
				temp.addEventListener("load", function(event) {
					self.relay = window.frames[url];
					readyPromise.resolve();
				}, false);
			}
 		 }, false);

		
		this.ready = function(func) {
			ready.push(func);
		};
		this.send = function () {
			var promises = this.request.apply(this, arguments);
			promises.resolve();
			return promises;
		};

		this.request = function () {
			var self = this, i, promises = [], it;
			for ( i = 0; i < arguments.length; i++ ) {
				messageId++;
				messages[messageId]= new RSVP.Promise();		
				it = arguments[i];	
				readyPromise.then(getHandler(self, messageId, it));
				promises.push( messages[messageId] );
			}
			return RSVP.all( promises );
		};
		window.addEventListener("message", function (event) {
			if (event.data.id) {
				messages[event.data.id].resolve(event.data.body);
				delete messages[event.data.id];
			}
		}, false);
	};
	return XDomainMessageClient;
}(window));

var XDomainMessageServer = (function () {
	return {
  		receive: function (cb) {
	  		var onMessage = cb;
	  		window.addEventListener(
	  			"message", 
	  			function (event) {
	  				var response = (function () {
	  					return {
	  						send: function (message) {
		  						event.source.postMessage({
									id: event.data.id,
									body: message
							 	}, "*");
	  						}
	  					};
	  				}());

		  			onMessage({
						"data": event.data.body, 
						"origin": event.origin, 
						"source": event.source 
		  			}, response);
				}, 
				false
			);
	  	}
  	};
}());
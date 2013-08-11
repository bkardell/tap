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

	var messageId = 0;
	var messages = {};
	var listening;
	var XDomainMessageClient = function (url) {
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

		if(!listening){
			/* The whole window gets 1 message listener for this... */
			window.addEventListener("message", function (event) {
				if (event.data.id) {
					console.log('received message' + event.data.id + "..." );
					messages[event.data.id].resolve(event.data.body);
					delete messages[event.data.id];
				}
			}, false);
			listening = true;
		}
		if (!url) {
			return null;
		}
		relay = window.frames[ url ];
		if(!relay){
			temp = document.createElement("iframe");
			temp.setAttribute("name",url);
			temp.src = url;
			temp = document.getElementsByTagName("head")[0].appendChild(temp);
			temp.style.display = "none";
			temp.addEventListener("load", function(event) {
				self.relay = window.frames[url];
				messageId++;
				messages[messageId] = new RSVP.Promise();
				self._list = messages[messageId];
				getHandler(self,messageId,{"cmd": "ls"}, "*")();
				messages[messageId].then(function (contents) {
					self.contents = contents;
					readyPromise.resolve();
				});
			}, false);
		}
		
		this.readyPromise = readyPromise;
		
		this.ready = function(func) {
			ready.push(func);
		};

		this.list = function () {
			return this._list;
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
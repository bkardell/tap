(function(exports){"use strict";var browserGlobal=typeof window!=="undefined"?window:{};var MutationObserver=browserGlobal.MutationObserver||browserGlobal.WebKitMutationObserver;var RSVP,async;if(typeof process!=="undefined"&&{}.toString.call(process)==="[object process]"){async=function(callback,binding){process.nextTick(function(){callback.call(binding)})}}else if(MutationObserver){var queue=[];var observer=new MutationObserver(function(){var toProcess=queue.slice();queue=[];toProcess.forEach(function(tuple){var callback=tuple[0],binding=tuple[1];callback.call(binding)})});var element=document.createElement("div");observer.observe(element,{attributes:true});async=function(callback,binding){queue.push([callback,binding]);element.setAttribute("drainQueue","drainQueue")}}else{async=function(callback,binding){setTimeout(function(){callback.call(binding)},1)}}var Event=function(type,options){this.type=type;for(var option in options){if(!options.hasOwnProperty(option)){continue}this[option]=options[option]}};var indexOf=function(callbacks,callback){for(var i=0,l=callbacks.length;i<l;i++){if(callbacks[i][0]===callback){return i}}return-1};var callbacksFor=function(object){var callbacks=object._promiseCallbacks;if(!callbacks){callbacks=object._promiseCallbacks={}}return callbacks};var EventTarget={mixin:function(object){object.on=this.on;object.off=this.off;object.trigger=this.trigger;return object},on:function(eventNames,callback,binding){var allCallbacks=callbacksFor(this),callbacks,eventName;eventNames=eventNames.split(/\s+/);binding=binding||this;while(eventName=eventNames.shift()){callbacks=allCallbacks[eventName];if(!callbacks){callbacks=allCallbacks[eventName]=[]}if(indexOf(callbacks,callback)===-1){callbacks.push([callback,binding])}}},off:function(eventNames,callback){var allCallbacks=callbacksFor(this),callbacks,eventName,index;eventNames=eventNames.split(/\s+/);while(eventName=eventNames.shift()){if(!callback){allCallbacks[eventName]=[];continue}callbacks=allCallbacks[eventName];index=indexOf(callbacks,callback);if(index!==-1){callbacks.splice(index,1)}}},trigger:function(eventName,options){var allCallbacks=callbacksFor(this),callbacks,callbackTuple,callback,binding,event;if(callbacks=allCallbacks[eventName]){for(var i=0,l=callbacks.length;i<l;i++){callbackTuple=callbacks[i];callback=callbackTuple[0];binding=callbackTuple[1];if(typeof options!=="object"){options={detail:options}}event=new Event(eventName,options);callback.call(binding,event)}}}};var Promise=function(){this.on("promise:resolved",function(event){this.trigger("success",{detail:event.detail})},this);this.on("promise:failed",function(event){this.trigger("error",{detail:event.detail})},this)};var noop=function(){};var invokeCallback=function(type,promise,callback,event){var value,error;if(callback){try{value=callback(event.detail)}catch(e){error=e}}else{value=event.detail}if(value instanceof Promise){value.then(function(value){promise.resolve(value)},function(error){promise.reject(error)})}else if(callback&&value){promise.resolve(value)}else if(error){promise.reject(error)}else{promise[type](value)}};Promise.prototype={then:function(done,fail){var thenPromise=new Promise;if(this.isResolved){RSVP.async(function(){invokeCallback("resolve",thenPromise,done,{detail:this.resolvedValue})},this)}if(this.isRejected){RSVP.async(function(){invokeCallback("reject",thenPromise,fail,{detail:this.rejectedValue})},this)}this.on("promise:resolved",function(event){invokeCallback("resolve",thenPromise,done,event)});this.on("promise:failed",function(event){invokeCallback("reject",thenPromise,fail,event)});return thenPromise},resolve:function(value){resolve(this,value);this.resolve=noop;this.reject=noop},reject:function(value){reject(this,value);this.resolve=noop;this.reject=noop}};function resolve(promise,value){RSVP.async(function(){promise.trigger("promise:resolved",{detail:value});promise.isResolved=true;promise.resolvedValue=value})}function reject(promise,value){RSVP.async(function(){promise.trigger("promise:failed",{detail:value});promise.isRejected=true;promise.rejectedValue=value})}EventTarget.mixin(Promise.prototype);RSVP={async:async,Promise:Promise,Event:Event,EventTarget:EventTarget};exports.RSVP=RSVP})(window);


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

var tap = (function(){
	var isReady, readyCbs = [];
	var head = document.head || document.getElementsByTagName('head')[0];
	var clients = {};	
	var injectScript = function( text ) {
		var script = document.createElement('script');
		//script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = text;
		head.appendChild( script );
	};
	var toArray = function(nodelist){
		return Array.prototype.slice.call(nodelist, 0);
	};
	return {
		setRepo: function (id, url) {
			clients[id] = new XDomainMessageClient(url);
		}, 
		init: function () {
			var toGet = [];
			var clients = toArray(head.querySelectorAll("meta[name='tap-repository']"));
			var stuff = toArray(head.querySelectorAll("[data-tap-get]"));
			
			clients.forEach(function (el) {
				var id = el.getAttribute("data-id") || "default";
				tap.setRepo(id, el.getAttribute("content"));
			});
			stuff.forEach(function(el){
				toGet.push({ "url": el.getAttribute("data-tap-get") });
			});
			this.get(toGet).then(function () {
				isReady = true;
				readyCbs.forEach(function (callback) {
					callback();
				});
			});
		}, 
		get: function (clientId, o) {
			var id = (arguments.length>1) ? clientId : "default";
			var req = (arguments.length>1) ? o : arguments[0];
			client = clients[id];
			return client.request(req).then(function (x) {
				x = x[0];
				for (var i=0;i<x.length;i++) {
					injectScript(x[i]);
				}
			});		
		}, 
		ready: function (cb) {
			if (isReady) { 
				cb(); 
			} else {
				readyCbs.push(cb);	
			}
		}
	}		
}());
tap.init();
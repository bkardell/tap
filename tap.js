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
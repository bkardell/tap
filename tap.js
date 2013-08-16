var tap = (function(){
	var isReady, readyCbs = [];
	var head = document.head || document.getElementsByTagName('head')[0];
	var clients = {requiresInit: true};
	var loadedUrls = {};
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

	var uid = 0;

	return {
		findRepo: function (url) {
			var id;
			// when we are here, all have sent back what they have...
			if (clients.requiresInit) {
				delete clients.requiresInit;
			}
			for (id in clients) {
				if (clients[id].contents[url]) {
					console.log('loading ' + url + ' from ' + id);
					return clients[id];
				}
			}
			console.log('loading ' + url + ' from ' + id);
			return clients[id]; // Here we will want to consult
		},
		setRepo: function (id, url) {
			clients[id] = new XDomainMessageClient(url);
			clients[id].id = id;
			return clients[id].readyPromise;
		},
		init: function () {
			var toGet = [];
			var clients = toArray(head.querySelectorAll("link[type='application/x-script-store']"));
			var stuff = toArray(head.querySelectorAll("[data-tap-get]"));
			var promises = [];

			clients.forEach(function (el) {
				var id = el.getAttribute("data-id") || ++uid;
				promises.push(tap.setRepo(id, el.getAttribute("href")));
			});

			stuff.forEach(function(el){
				toGet.push({ "url": el.getAttribute("data-tap-get") });
			});

			var self = this;
			RSVP.all(promises).then(function () {
				self.get(toGet).then(function () {
					isReady = true;
					readyCbs.forEach(function (callback) {
						callback();
					});
				});
			});
		},
		get: function (clientId, o) {
			var id = (arguments.length>1) ? clientId : "0";
			var req = (arguments.length>1) ? o : arguments[0];
			var client = clients[id];
			var promises = [];
			if (arguments.length === 1) {
				for (var i=0;i<req.length;i++) {
					promises.push(this.findRepo(req[i].url).request(req[i]));
				}
				return RSVP.all(promises).then(function (x) {
					x = x[0];
					for (var i=0;i<x.length;i++) {
						injectScript(x[i]);
					}
				});
			} else {
				return client.request(req).then(function (x) {
					x = x[0];
					for (var i=0;i<x.length;i++) {
						injectScript(x[i]);
					}
				});
			}
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
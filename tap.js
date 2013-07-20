var tap = (function(){
	var head = document.head || document.getElementsByTagName('head')[0];
	var client;	
	var injectScript = function( text ) {
		var script = document.createElement('script');
		//script.defer = true;
		// Have to use .text, since we support IE8,
		// which won't allow appending to a script
		script.text = text;
		head.appendChild( script );
	};
	return {
		setRepo: function(url){
			client = new XDomainMessageClient(url);
		}, 
		get: function(o){
			return client.request(o).then(function(x){
				x = x[0];
				for (var i=0;i<x.length;i++) {
					injectScript(x[i]);
				}
			});		
		}
	}		
}());
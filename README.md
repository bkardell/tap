What the heck is it?
====================

A crazy POC of something like APT using x-domain local storage against a univeral repository as suggested by a few people - most recently yoav weiss brough it up again on extensible web group...

In other words, we can create a repository in a given domain and then use localStorage in that domain to create a better/faster cache that is less likely to miss and use it from whatever domain we like.  It could heavy handedly initialize (download) some things, but for now it is fetched if not present the first time and then persisted.


You can view the lamest demo ever at http://bkardell.github.io/test-repo/index.html

Usage
======

Currently there is no build and this builds on a few layers, promises and a message client relay to allow simpler communication sugar through postmessage/message channel which is in turn build on promises via RSVP and all of this uses basket.js.

That means for now, you have to include the following in your page...

```html
<!-- 
    Place this dependency in the head of your document manually for now... 
    Because I have no build... 
-->
<script type="application/javascript" src="http://bkardell.github.io/test-repo/MessageClientRelay.js"></script>

```

Declaratively let your page know that you are using a repo via a meta tag:
```html
<meta name="tap-repository" content="hhttp://bkardell.github.io/test-repo/repository.html">
```    

Declaratively let your page know which files should be loaded from said repository:
```html
<!-- in the head, as per normal -->
<script data-tap-get="hitch-0.6.3-min.js"></script>
<script data-tap-get="jquery-1.10.2.min.js"></script>
```    

Include tap...
```html
<!-- This has to go *after* your tags above... -->
<script type="application/javascript" src="http://bkardell.github.io/test-repo/tap.js"></script>
```

Wanna know when scripts are ready?
```html
<script>
	tap.ready(function(){
		document.getElementById("test").value = 
			"All my files loaded... Anyone using this repo shouldnt have to fetch again..."
			"\nhitch: " + Hitch
			"\nJQuery: " + $;
	});
</script>
```
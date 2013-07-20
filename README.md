What the heck is it?
====================

A crazy POC of something like APT using x-domain local storage against a univeral repository as suggested by a few people - most recently yoav weiss brough it up again on extensible web group...

In other words, we can create a repository in a given domain and then use localStorage in that domain to create a better/faster cache that is less likely to miss and use it from whatever domain we like.  It could heavy handedly initialize (download) some things, but for now it is fetched if not present the first time and then persisted.

Usage
======

Currently there is no build and this builds on a few layers, promises and a message client relay to allow simpler communication sugar through postmessage/message channel which is in turn build on promises via RSVP and all of this uses basket.js.

That means for now, you have to include the following in your page...

```html
<!-- Place this in the head of your document --> 
<script type="application/javascript" src="http://bkardell.github.io/test-repo/MessageClientRelay.js"></script>
<script type="application/javascript" src="http://bkardell.github.io/test-repo/tap.js"></script>
```

And then you can begin using a repository... The easiest way is mark scripts you want to load from the repo:
```html
<!-- Place these in the head as you would any other -->
<script data-tap-get="hitch-0.6.3-min.js"></script>
<script data-tap-get="jquery-1.10.2.min.js"></script>
```	

And then wire up and scan... 
```html
<!-- This also can go in the head... -->
<script type="application/javascript">			
	tap.setRepo("http://localhost/~bkardell/tap/serverRelay.html");
	tap.scan(function(){
        console.log('All my files loaded... Anyone using this repo shouldnt have to fetch again...');
		console.log("hitch: " + Hitch);
		console.log("JQuery: " + $);
});
</script>
```

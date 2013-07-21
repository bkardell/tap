What the heck is it?
====================

A crazy POC of something like APT using x-domain local storage against a univeral repository as suggested by a few people - most recently Yoav Weiss broughT it up again on extensible web group...

Basically:  We can specially load/cache JavaScript via a special "repository" which winds up in storage not subject to the same sorts of problems as cache and share those files across domains.  





How does it work?
====================
Your client loads **tap.js** - it's fairly small, do it however you like.  

It loads up an iframe to a **repository** - just an html compiled with JavaScript inline (with decent cache advice, this should be less than the cost of a normal script include for any one library). It builds on a few layers, promises and a message client relay to allow simpler communication sugar through postmessage/message channel which is in turn build on promises (via **RSVP**) and all of this uses **basket.js** as a special **localStorage** based cache which is not subject to the same frequent expulsions and misses as standard browser cache.  


**Once populated, no website using that repo should have to ask for it again**.


Repos can be populated as requested and can lazily prime common libraries to further decrease the likelihood a download will ever be made. 

You can view maybe the lamest demo ever at http://bkardell.github.io/test-repo/index.html

Client Usage
======

Declaratively let your page know that you are using a repo via a meta tag:
```html
<meta name="tap-repository" content="hhttp://bkardell.github.io/test-repo/repository.html">
```    

...and which files should be loaded from said repository:
```html
<!-- in the head, as per normal -->
<script data-tap-get="hitch-0.6.3-min.js"></script>
<script data-tap-get="jquery-1.10.2.min.js"></script>
```    

Include tap...
```html
<!-- This has to go *after* your tags above... -->
<script type="application/javascript" src="http://bkardell.github.io/test-repo/dist/tap.js"></script>
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

.... **That's it.** 

Can I create a Repo?
=======
Duh.  Of course.  Pull down http://bkardell.github.io/test-repo, place some files in the **/libs** folder.  Then run one of the following..

```javascript
// creates a repository which loads files from your /libs folder on demand...
node create

// make it lazily loads things that aren't already stored/requested (1 file every 15 seconds)...
node create lazy

// tweak the lazy timing in ms (1 file every minute).
node create lazy 60000
```

If you ever add files to your repo, just re-run the create script.

Upload **repository.html** and **/libs** somewhere.


.... **That's it.** 


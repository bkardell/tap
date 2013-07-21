var fs = require('fs');

var source = [
    '<script type="application/javascript">',
	fs.readFileSync('rsvp.js', 'utf8'), 
	fs.readFileSync('MessageClientRelay.js', 'utf8'), 
	fs.readFileSync('basket.js', 'utf8'),
	fs.readFileSync('repo.js', 'utf8'),
	'</script>'	 
];

var templ = fs.readFileSync('repository-template.html', 'utf8');

var libs = fs.readdirSync("libs");
var preload = [];
for(var i=0; i<libs.length;i++){
	if(libs[i].charAt(0) !== '.' && /\.js$/.test(libs[i])){
		preload.push("libs/" + libs[i]);
	}
}

templ = templ.replace("<<lazy>>", JSON.stringify(preload));

fs.writeFileSync(
	'repository.html', 
	templ.replace("<<content>>", source.join("\n\n"))
);



source = [
  	fs.readFileSync('rsvp.js', 'utf8'), 
	fs.readFileSync('MessageClientRelay.js', 'utf8'), 
	fs.readFileSync('tap.js', 'utf8')
];

fs.writeFileSync(
	"dist/tap.js", 
	source.join("\n\n")
);


console.log("all set...");

var fs = require("fs");
var lazySpeed = 15000;
var temp;
var source = [
    "<script type=\"application/javascript\">",
	fs.readFileSync("rsvp.js", "utf8"),
	fs.readFileSync("MessageClientRelay.js", "utf8"),
	fs.readFileSync("basket.js", "utf8"),
	fs.readFileSync("repo.js", "utf8"),
	"</script>"
];

var templ = fs.readFileSync("repository-template.html", "utf8");

var libs = fs.readdirSync("libs");
var preload = [];

if (process.argv.length>2 && process.argv[2] === "lazy") {
	for (var i=0; i<libs.length;i++) {
		if (libs[i].charAt(0) !== "." && /\.js$/.test(libs[i])) {
			preload.push("libs/" + libs[i]);
		}
	}
}

if (process.argv.length>3) {
	temp = parseInt(process.argv[3],10);
	lazySpeed = (isNaN(temp)) ? lazySpeed : temp;
}

templ = templ.replace("<<libs>>", JSON.stringify(preload)).replace("<<speed>>", lazySpeed).replace("<<lazy>>", preload.length > 0);

fs.writeFileSync(
	"repository.html",
	templ.replace("<<content>>", source.join("\n\n"))
);



source = [
  	fs.readFileSync("rsvp.js", "utf8"),
	fs.readFileSync("MessageClientRelay.js", "utf8"),
	fs.readFileSync("tap.js", "utf8")
];

fs.writeFileSync(
	"dist/tap.js",
	source.join("\n\n")
);


console.log("all set...");
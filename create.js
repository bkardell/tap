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

fs.writeFileSync(
	'repository.html', 
	templ.replace("<<content>>", source.join("\n\n"))
);

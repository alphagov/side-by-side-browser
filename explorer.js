var fs = require('fs');

// simplest possible web server for the single-page app

module.exports.request = function (req, rsp) {
	var content = fs.readFileSync("public/index.html");

	rsp.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	rsp.end(content);
};

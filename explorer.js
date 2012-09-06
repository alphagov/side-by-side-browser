var http = require('http');
var fs = require('fs');

var explorer = {};

/*
 *  single page app
 */
explorer.html = function (req, rsp, name, statusCode) {
	var content = fs.readFileSync("public/" + name + ".html");
	rsp.writeHead(statusCode || 200, {'Content-Type': 'text/html; charset=utf-8'});
	rsp.end(content);
};


/*
 *  use redirector to present mapping information as json
 */
explorer.head = function (req, rsp, path, redirector, upstream) {

	var options = {
		'method': 'HEAD',
		'host': redirector,
		'path': path,
		'headers': {
			'host': upstream
		}
	};

	var red = http.request(options, function(res) {
		var head = {
			'options': options,
			'headers': res.headers,
			'statusCode': res.statusCode,
			'location': res.headers.location
		};
		rsp.writeHead(200, {'Content-Type': 'application/json'});
		rsp.end(JSON.stringify(head));
	})
	red.end();
};

/*
 *  explorer
 */
explorer.request = function (req, rsp, path, redirector, upstream) {

	if (path.match(/^\/$/)) {
		return explorer.html(req, rsp, 'index');
	}

	if (path.match(/^\/410$/)) {
		return explorer.html(req, rsp, '410');
	}

	if (path.match(/^\/418$/)) {
		return explorer.html(req, rsp, '418');
	}

	if (path.match(/^\/head\//)) {
		path = path.replace(/^\/head/, "");
		return explorer.head(req, rsp, path, redirector, upstream);
	} 

	return explorer.html(req, rsp, '404', 404);
}

module.exports = explorer;

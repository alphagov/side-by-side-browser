var http = require('http');
var https = require('https');
var fs = require('fs');
var util = require('util');
var url = require('url');

var explorer = {};

/*
 *  serve html file
 */
explorer.html = function (req, rsp, name, statusCode) {
	var content = fs.readFileSync("public/" + name + ".html");
	rsp.writeHead(statusCode || 200, {'Content-Type': 'text/html; charset=utf-8'});
	rsp.end(content);
};

/*
 *  serve JSON content
 */
explorer.json = function (req, rsp, content) {
	rsp.writeHead(200, {'Content-Type': 'application/json'});
	rsp.end(JSON.stringify(content));
}

/*
 *  use redirector to present mapping information as json
 */
explorer.head = function (req, rsp, path, info) {

	var options = {
		'method': 'HEAD',
		'host': info.redirector,
		'path': path,
		'headers': {
			'host': info.upstream
		}
	};

	var red = http.request(options, function(res) {
		var head = {
			'headers': res.headers,
			'statusCode': res.statusCode,
			'location': res.headers.location
		};
		util.log(':head: ' + head.statusCode + " " +  options.path + " " + head.location);

		if (!head.location) {
			return explorer.json(req, rsp, head);
		}

		/* 
		 *  follow redirect, well one hop, to see status
		 *  - used to decide if new page is awaiting publication
		 */
		var o = url.parse(head.location);

		options = {
			'method': 'HEAD',
			'host': o.host,
			'path': o.pathname
		};

		var protocol = (o.protocol === "https:") ? https : http;

		var follow = protocol.request(options, function(res) {
			head.newStatusCode = res.statusCode;
			util.log(':follow: ' + head.newStatusCode + " " + o.protocol + " " + o.host + " " + o.pathname);
                        if (head.newStatusCode === 404 && o.host === "www.gov.uk") {
                            head.location = "https://private-frontend.production.alphagov.co.uk" + o.pathname + "?edition=1";
                        }
			return explorer.json(req, rsp, head);
		});
		follow.end();
	})
	red.end();
};

/*
 *  explorer
 */
explorer.request = function (req, rsp, path, info) {

	/*
	 *  serve the single-page app
	 */
	if (path.match(/^\/$/)) {
		return explorer.html(req, rsp, 'index');
	}

	if (path.match(/^\/info.json$/)) {
		return explorer.json(req, rsp, info);
	}

	/*
	 *  proxy the redirector
	 */
	if (path.match(/^\/head\//)) {
		path = path.replace(/^\/head/, "");
		return explorer.head(req, rsp, path, info);
	} 

	/*
	 *  error pages
	 */
	if (path.match(/^\/410$/)) {
		return explorer.html(req, rsp, '410');
	}

	if (path.match(/^\/418$/)) {
		return explorer.html(req, rsp, '418');
	}

	/*
	 *  quick and dirty decomission
	 */
	if (path.match(/^\/(explore|sign_in)\/*/)) {
		rsp.writeHead(302, {'Location': 'http://explore-dg.production.alphagov.co.uk/__/'});
		rsp.end();
	} 

	return explorer.html(req, rsp, '404', 404);
}

module.exports = explorer;

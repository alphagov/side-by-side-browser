#!/usr/bin/env node

var http = require('http');
var util = require('util');
var fs = require('fs');

var port = 8000;

var PROXY_ROOT = 'localhost:' + port

function proxy(req, rsp, host) {
	req.headers['host'] = host;

	var upstream = http.createClient(80, host);
	var upstream_req = upstream.request(req.method, req.url, req.headers);

	upstream_req.on('response', function(upstream_rsp) {
		if (upstream_rsp.headers.location) {
			upstream_rsp.headers.location = upstream_rsp.headers.location.replace(new RegExp(host, "g"), PROXY_ROOT);
		}
		rsp.writeHead(upstream_rsp.statusCode, upstream_rsp.headers);

		var transform = (upstream_rsp.headers['content-type'] || "").match(/^text\/html/);
		var dataArr = [];

		upstream_rsp.on('data', function(data) {
			if (transform) {
				dataArr.push(data.toString());
			} else {
				rsp.write(data, 'binary');
			}
		});

		upstream_rsp.on('end', function() {
			if (transform) {
				var data = dataArr.join('');
				data = data.replace(new RegExp(host, "g"), PROXY_ROOT);				
				rsp.write(data);
			}
			rsp.end();
		});
	});

	req.on('data', function(data) {
		upstream_req.write(data, 'binary');
	});

	req.on('end', function() {
		upstream_req.end();
	});
}

function servefile(req, rsp, path) {
	var content = fs.readFileSync(path);
	rsp.writeHead(200, {'Content-Type': 'text/html'});
	rsp.end(content);
}

http.createServer(function (req, rsp) {

	var ip = req.connection.remoteAddress;
	util.log(ip + ": " + req.method + " " + req.url);

	if (req.url.match(/^\/*browser$/)) {
		servefile(req, rsp, 'index.html');
	} else {
		proxy(req, rsp, 'www.direct.gov.uk');
	}


}).listen(port);

console.log('listening to port ' + port);

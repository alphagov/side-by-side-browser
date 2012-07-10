#!/usr/bin/env node

var http = require('http');
var https = require('https');
var util = require('util');
var fs = require('fs');

var port = 8000;

var MIGRATORATOR_API = 'migratorator.production.alphagov.co.uk';
var PROXY_ROOT = 'localhost:' + port;

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

function processMapping(req, rsp, path) {
	var options = {
		host: 'migratorator.production.alphagov.co.uk',
		path: path,
		auth: process.env.MIGRATORATOR_AUTH
	};

	var req = https.request(options, function (res) {
		var data = [];
		res.on('data', function (d) { 
			data.push(d.toString()); 
		})
		res.on('end', function () {
			rsp.writeHead(200, {'content-type': 'application/json'});
			rsp.end(data.join(''));
		});
	});

	req.end();
}

http.createServer(function (req, rsp) {
	var m;
	var ip = req.connection.remoteAddress;
	
	util.log(ip + ": " + req.method + " " + req.url);

	if (req.url.match(/^\/browser$/)) {
		servefile(req, rsp, 'index.html');
	} else if ((m = req.url.match(/^\/mapping(\/.*)$/))) {
		processMapping(req, rsp, m[1]);
	} else {
		proxy(req, rsp, 'www.direct.gov.uk');
	}


}).listen(port);

console.log('listening to port ' + port);

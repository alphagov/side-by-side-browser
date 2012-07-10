#!/usr/bin/env node

var http = require('http');
var util = require('util');
var fs = require('fs');

var port = 8000;

var INJECT = "<span id='browser-proxy-hack'>&nbsp;</span>";
INJECT += "<script>$(function () { $('#browser-proxy-hack').attr('data-loc', window.location.href).click(); });</script>";

function filterData(rsp, data) {
	var transform = (rsp.headers['content-type'] || "").match(/^text\/html/);
	var data = data.toString();
	
	// data = data.replace('</body>', INJECT + '</body>');

	if (transform) {
		data = data.replace(/www.direct.gov.uk/g, "localhost:8000");
	}
	
	return data;
}


function proxy(req, rsp, host) {
	req.headers['host'] = host;

	var upstream = http.createClient(80, host);
	var upstream_req = upstream.request(req.method, req.url, req.headers);

	upstream_req.on('response', function(upstream_rsp) {
		rsp.writeHead(upstream_rsp.statusCode, upstream_rsp.headers);

		upstream_rsp.on('data', function(data) {
			rsp.write(new Buffer(filterData(upstream_rsp, data)), 'binary');
		});

		upstream_rsp.on('end', function() {
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

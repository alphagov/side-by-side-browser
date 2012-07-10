#!/usr/bin/env node

var http = require('http');
var https = require('https');
var util = require('util');
var fs = require('fs');

var PROXY_HOST = process.env.PROXY_HOST || 'www.direct.gov.uk';
var PORT = process.env.PORT || 8000;
var MIGRATORATOR_API = process.env.MIGRATORATOR_API || 'migratorator.production.alphagov.co.uk';
var MIGRATORATOR_AUTH = process.env.MIGRATORATOR_AUTH;

if (!MIGRATORATOR_AUTH) {
	throw "You must set the MIGRATORATOR_AUTH environment variable to auth credentials in the form 'username:password'!";
}

var RewriterProxy = function RewriterProxy(host, ssl) {
	var clientLib = ssl ? https : http;
	var proto = ssl ? "https" : "http";

	this.process = function process(req, res) {
		req.headers.host = host;

		var remoteReq = clientLib.request({
			host: host,
			method: req.method,
			headers: req.headers,
			path: req.url
		});

		remoteReq.on('error', console.error);

		remoteReq.on('response', function (remoteRes) {
			var buffer = [];
			var doTransform = (remoteRes.headers['content-type'] || "").match(/^text\/html/);

			if (remoteRes.headers.location) {
				remoteRes.headers.location = remoteRes.headers.location.replace(new RegExp("^" + proto + "://" + host, "g"), '');
			}

			res.writeHead(remoteRes.statusCode, remoteRes.headers);

			remoteRes.on('data', function(data) {
				if (doTransform) {
					buffer.push(data);
				} else {
					res.write(data);
				}
			});

			remoteRes.on('end', function() {
				if (doTransform) {
					var data = buffer.join('').toString();
					data = data.replace(new RegExp(proto + '://' + host, 'g'), '');
					res.write(data);
				}
				res.end();
			});
		});

		req.on('data', function (data) {
			remoteReq.write(data);
		});

		req.on('end', function () {
			remoteReq.end();
		});
	};

	return this;
};

var AuthenticatingProxy = function AuthenticatingProxy(host, auth, ssl) {
	var clientLib = ssl ? https : http;

	this.process = function pipe(req, rsp) {
		var options = {
			host: host,
			auth: auth,
			path: req.url
		};

		var remoteReq = clientLib.request(options, function (res) {
			var data = [];
			res.on('data', function (d) {
				data.push(d.toString());
			});
			res.on('end', function () {
				rsp.writeHead(200, {'content-type': 'application/json'});
				rsp.end(data.join(''));
			});
		});

		remoteReq.end();
	};

	return this;
};

var fail = function fail(req, res, msg) {
	res.writeHead(400, {'content-type': 'application/json'});
	res.end(JSON.stringify({status: 400, error: msg}));
};

var serveFile = function serveFile(fname, req, res) {
	fs.readFile(fname, function (err, data) {
		if (err) { throw err; }
		res.writeHead(200, {'content-type': 'text/html'});
		res.end(data);
	});
};

var rewriterProxy = new RewriterProxy(PROXY_HOST);
var migratoratorProxy = new AuthenticatingProxy(MIGRATORATOR_API, MIGRATORATOR_AUTH, true);

http.createServer(function (req, res) {
	var m;
	var ip = req.connection.remoteAddress;

	util.log(ip + ": " + req.method + " " + req.url);

	if (req.url.match(/^\/__browser__(\/?.*)$/)) {
		serveFile('index.html', req, res);
	} else if ((m = req.url.match(/^\/__mapping__(\/?.*)$/))) {
		req.url = m[1] || '/';
		migratoratorProxy.process(req, res);
	} else {
		rewriterProxy.process(req, res);
	}

}).listen(PORT);

console.log('Server started: point your browser at http://localhost:' + PORT + '/__browser__');

#!/usr/bin/env node

"use strict";

var http = require('http');
var https = require('https');
var util = require('util');
var fs = require('fs');

var PORT = process.env.PORT || 8096;

var REWRITER_HOST = process.env.REWRITER_HOST || 'www.direct.gov.uk';

var UPSTREAM_HOST = process.env.UPSTREAM_HOST || 'reviewomatic.production.alphagov.co.uk';
var UPSTREAM_AUTH = process.env.UPSTREAM_AUTH;
var UPSTREAM_PROTOCOL = process.env.UPSTREAM_PROTOCOL || "https";

var API_HOST = process.env.API_HOST || 'migratorator.production.alphagov.co.uk';
var API_AUTH = process.env.API_AUTH || process.env.UPSTREAM_AUTH;
var API_PROTOCOL = process.env.API_PROTOCOL || "https";

if (!UPSTREAM_AUTH) {
	throw "You must set the UPSTREAM_AUTH environment variable to auth credentials in the form 'username:password'!";
}

var Proxy = function (host, transform, protocol, auth, namespace) {
	var client = (protocol === "https") ? https : http;
	protocol = protocol || "http";

	this.request = function (req, res) {
		req.headers.host = host;

		var options = {
			host: host,
			method: req.method,
			headers: req.headers,
			path: req.url
		};

		if (auth) {
			options.auth = auth;
		}

		if (namespace) {
			options.path = options.path.replace(namespace, "");
		}

		var remoteReq = client.request(options);

		remoteReq.on('error', console.error);

		remoteReq.on('response', function (remoteRes) {

			var buffer = [];
			var doTransform = transform && (remoteRes.headers['content-type'] || "").match(/^text\/html/);

			if (doTransform) {
				delete remoteRes.headers['content-length'];

				if (remoteRes.headers.location) {
					remoteRes.headers.location = remoteRes.headers.location.replace(new RegExp("^" + protocol + "://" + host, "g"), '');
				}
			}

			res.writeHead(remoteRes.statusCode, remoteRes.headers);

			remoteRes.on('data', function (data) {
				if (doTransform) {
					buffer.push(data);
				} else {
					res.write(data);
				}
			});

			remoteRes.on('end', function () {
				if (doTransform) {
					var data = buffer.join('').toString();
					data = data.replace(new RegExp(protocol + '://' + host, 'g'), '');
					data = data.replace(new RegExp('<a target="', 'g'), '<a _target="');
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

var apiProxy = new Proxy(API_HOST, false, API_PROTOCOL, API_AUTH, "/__api");
var upstreamProxy = new Proxy(UPSTREAM_HOST, false, UPSTREAM_PROTOCOL, UPSTREAM_AUTH);
var rewriterProxy = new Proxy(REWRITER_HOST, true);

http.createServer(function (req, res) {
	var ip = req.connection.remoteAddress;

	util.log(ip + ": " + req.method + " " + req.url);

	if (req.url.match(/^\/__api/)) {
		apiProxy.request(req, res);
	} else if (req.url.match(/^\/__/)) {
		upstreamProxy.request(req, res);
	} else {
		rewriterProxy.request(req, res);
	}

}).listen(PORT);

console.log('Proxy started: point your browser at http://localhost:' + PORT + '/__');

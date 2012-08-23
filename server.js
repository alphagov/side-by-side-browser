#!/usr/bin/env node

"use strict";

var http = require('http');
var https = require('https');
var util = require('util');
var proxy = require('./proxy');
var Proxy = proxy.Proxy;
var Transform = proxy.Transform;

var PORT = process.env.REVIEWOMATIC_EXPLORE_PORT || process.env.PORT || 8096;
var REVIEWOMATIC_AUTH = process.env.REVIEWOMATIC_AUTH;
var REVIEWOMATIC_HOST = process.env.REVIEWOMATIC_HOST || 'reviewomatic.production.alphagov.co.uk';
var UPSTREAM_HOST = process.env.UPSTREAM_HOST || 'www.direct.gov.uk';

if (!REVIEWOMATIC_AUTH) {
	throw "You must set the REVIEWOMATIC_AUTH environment variable to auth credentials in the form 'username:password'!";
}

var reviewomaticProxy = new Proxy(REVIEWOMATIC_HOST, false, 'http', REVIEWOMATIC_AUTH);
var upstreamProxy = new Proxy(UPSTREAM_HOST, true);

http.createServer(function (req, res) {
	var ip = req.connection.remoteAddress;

	util.log(ip + ": " + req.method + " " + req.url);

	if (req.url.match(/^\/__/)) {
		reviewomaticProxy.request(req, res);
	} else {
		upstreamProxy.request(req, res);
	}

}).listen(PORT);

console.log('Proxy started: point your browser at http://localhost:' + PORT + '/__');
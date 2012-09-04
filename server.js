#!/usr/bin/env node

"use strict";

var http = require('http');
var https = require('https');
var util = require('util');
var proxy = require('./proxy');
var explorer = require('./explorer');
var Proxy = proxy.Proxy;
var Transform = proxy.Transform;

var PORT = process.env.REVIEWOMATIC_EXPLORE_PORT || process.env.PORT || 3023;

http.createServer(function (req, res) {
	var upstreamHost;
	var upstreamProxy;
	var ip = req.connection.remoteAddress;

	util.log(ip + ": " + req.method + " " + req.url);

	if (req.url.match(/^\/__/)) {
		// server single-page application
		explorer.request(req, res);
	} else {
		// upstream host presented on left-hand-side
		upstreamHost = req.headers['x-explore-upstream'] || 'www.direct.gov.uk';
		upstreamProxy = new Proxy(upstreamHost, true);
		upstreamProxy.request(req, res);
	}

}).listen(PORT);

console.log('Proxy started: point your browser at http://localhost:' + PORT + '/__/');

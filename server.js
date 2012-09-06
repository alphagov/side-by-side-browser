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
var REDIRECTOR = "redirector.preview.alphagov.co.uk";
var UPSTREAM = 'www.direct.gov.uk';

http.createServer(function (req, res) {
	var redirector = req.headers['x-explore-redirector'] || REDIRECTOR;
	var upstream = req.headers['x-explore-upstream'] || UPSTREAM;
	var ip = req.connection.remoteAddress;
	var upstreamProxy;
	var path;

	util.log(ip + ": " + req.method + " " + upstream + " " + req.url);

	if (req.url.match(/^\/__\//)) {
		// explorer single-page application and API
		path = req.url.replace(/^\/__/, "");
		explorer.request(req, res, path, redirector, upstream);
	} else {
		// upstream host presented on left-hand-side
		upstreamProxy = new Proxy(upstream, true);
		upstreamProxy.request(req, res);
	}

}).listen(PORT);

console.log('Proxy started: point your browser at http://localhost:' + PORT + '/__/');

#!/usr/bin/env node

"use strict";
var http = require('http');
var https = require('https');
var util = require('util');
var fs = require('fs');

var PORT = process.env.REVIEWOMATIC_EXPLORE_PORT || process.env.PORT || 8096;

var UPSTREAM_HOST = process.env.UPSTREAM_HOST || 'reviewomatic.production.alphagov.co.uk';
var UPSTREAM_AUTH = process.env.UPSTREAM_AUTH;
var UPSTREAM_PROTOCOL = process.env.UPSTREAM_PROTOCOL || "https";

var API_HOST = process.env.API_HOST || 'dummy.preview.alphagov.co.uk';
var API_AUTH = process.env.API_AUTH || process.env.UPSTREAM_AUTH;
var API_PROTOCOL = process.env.API_PROTOCOL || "https";

var proxy = require('./proxy');
var Proxy = proxy.Proxy;
var Transform = proxy.Transform;

if (!UPSTREAM_AUTH) {
	throw "You must set the UPSTREAM_AUTH environment variable to auth credentials in the form 'username:password'!";
}

var upstreamProxy = new Proxy(UPSTREAM_HOST, false, UPSTREAM_PROTOCOL, UPSTREAM_AUTH);
var apiProxy = new Proxy(API_HOST, false, API_PROTOCOL, API_AUTH, true);

/* When using the migratorator to get mappings, use these two lines and comment
out the four lines below */
var REWRITER_HOST = process.env.REWRITER_HOST || 'www.direct.gov.uk';
var rewriterProxy = new Proxy(REWRITER_HOST, true);

/* when using the redirector to get mappings, use these four lines and comment
out the two lines above */

// function rewriterProxy (req, res) {
//     var rewriterProxyInstance = new Proxy(req.headers['X-Explore-Upstream'], true); 
//     return rewriterProxyInstance.request(req, res);
// }

http.createServer(function (req, res) {
	var ip = req.connection.remoteAddress;

	util.log(ip + ": " + req.method + " " + req.url);

	if (req.url.match(/^\/__api/)) {
        req.url = req.url.replace('/__api', '');
		apiProxy.request(req, res);
	} else if (req.url.match(/^\/__/)) {
		upstreamProxy.request(req, res);
	} else {
        /* for migratorator mappings */
       	rewriterProxy.request(req, res);
        /* for redirector mappings */
        //rewriterProxy(req, res);
 	}

}).listen(PORT);

console.log('Proxy started: point your browser at http://localhost:' + PORT + '/__');
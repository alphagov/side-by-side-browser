#!/usr/bin/env node

"use strict";

var http = require('http');
var https = require('https');
var util = require('util');
var proxy = require('./proxy');
var explorer = require('./explorer');
var hostname = require('./hostname');

var Proxy = proxy.Proxy;
var Transform = proxy.Transform;

var PORT = process.env.SIDE_BY_SIDE_PORT || 3023;

http.createServer(function (req, res) {
  var ip = req.connection.remoteAddress;
  var upstreamProxy;
  var path;
  var info = {};

  /*
   *  info is shared with the client-side as JSON
   */
  info.upstream = req.headers['x-explore-upstream'] || hostname.upstream(req.headers.host) || 'www.ukba.homeoffice.gov.uk';
  info.upstream_protocol = req.headers['x-explore-upstream-protocol'] || 'http';
  info.redirector = req.headers['x-explore-redirector'] || hostname.aka(info.upstream);

  util.log(req.method + " " + info.upstream + " " + req.url);

  if (req.url.match(/^\/__\//)) {
    // explorer single-page application and API
    path = req.url.replace(/^\/__/, "");
    explorer.request(req, res, path, info);
  } else {
    // upstream host presented on left-hand-side
    upstreamProxy = new Proxy(info.upstream, true);
    upstreamProxy.request(req, res);
  }

}).listen(PORT);

console.log('Proxy started: point your browser at http://localhost:' + PORT + '/__/');

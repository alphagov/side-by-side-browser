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
  var ip = req.connection.remoteAddress;
  var upstreamProxy;
  var path;

  var info = {
    title: req.headers['x-explore-title'] || "ukba",
    upstream: req.headers['x-explore-upstream'] || 'www.ukba.homeoffice.gov.uk',
    upstream_protocol: req.headers['x-explore-upstream-protocol'] || 'http',
    redirector: req.headers['x-explore-redirector'] || 'aka.ukba.homeoffice.gov.uk',
  };

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

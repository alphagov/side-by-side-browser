var http = require('http');
var https = require('https');
var fs = require('fs');
var util = require('util');
var url = require('url');

var explorer = {};

/*
 *  serve html file
 */
explorer.html = function (req, rsp, name, statusCode) {
  var content = fs.readFileSync("public/" + name + ".html");
  rsp.writeHead(statusCode || 200, {'Content-Type': 'text/html; charset=utf-8'});
  rsp.end(content);
};

/*
 *  serve JSON content
 */
explorer.json = function (req, rsp, content) {
  rsp.writeHead(200, {'Content-Type': 'application/json'});
  rsp.end(JSON.stringify(content));
}

/*
 *  use redirector to present mapping information as json
 */
explorer.head = function (req, rsp, path, info) {

  // default/fallthrough action: hit the redirector and let the browser do the
  // rest.
  var fallthrough = function () {
    util.log(':fallthrough: ' + path);
    return explorer.json(req, rsp, {
      'location': info.upstream_protocol + '://' + info.redirector + path
    });
  };

  var redirectorOpts = {
    'method': 'HEAD',
    'host': info.redirector,
    'path': path,
    'headers': {
      'host': info.upstream
    }
  };

  http.request(redirectorOpts, function(res) {

    util.log(':head: ' + res.statusCode + " " + path + " " + res.headers.location);

    if (res.statusCode != 301) {
      return fallthrough();
    }

    // follow redirect one hop, to see status - used to decide if new page is awaiting publication
    var nextLoc = url.parse(res.headers.location);
    var nextOpts = {
      'method': 'HEAD',
      'host': nextLoc.host,
      'path': nextLoc.pathname
    };

    var proto = (nextLoc.protocol === "https:") ? https : http;
    proto.request(nextOpts, function(res) {
      util.log(':follow: ' + res.statusCode + ' ' + nextLoc.host + ' ' + nextLoc.pathname);

      if (res.statusCode === 404 && nextLoc.host === "www.gov.uk") {
        return explorer.json(req, rsp, {
          'location': 'https://private-frontend.production.alphagov.co.uk' + nextLoc.pathname + '?edition=1'
        });
      }

      return fallthrough();

    }).end();
  }).end();
};

/*
 *  explorer
 */
explorer.request = function (req, rsp, path, info) {

  /*
   *  serve the single-page app
   */
  if (path.match(/^\/$/)) {
    return explorer.html(req, rsp, 'index');
  }

  if (path.match(/^\/info.json$/)) {
    return explorer.json(req, rsp, info);
  }

  /*
   *  proxy the redirector
   */
  if (path.match(/^\/head\//)) {
    path = path.replace(/^\/head/, "");
    return explorer.head(req, rsp, path, info);
  }

  return explorer.html(req, rsp, '404', 404);
}

module.exports = explorer;

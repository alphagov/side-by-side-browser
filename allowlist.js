/*
 *  load allowlist in JSON format produced by the transition application
 *
 *    - https://transition.production.alphagov.co.uk/hosts
 *    - https://github.com/alphagov/transition/blob/master/app/presenters/hosts_presenter.rb
 */
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    url = require('url'),
    util = require('util');

/*
 *  default values
 */
var home = process.env.SIDE_BY_SIDE_HOME || "";
var hostsFilename = process.env.SIDE_BY_SIDE_HOSTS || home + "etc/hosts.json";

/*
 *  allowed hostnames
 */
var hosts = {};

/*
 *  parse and populate list of allowed hostnames
 */
function parse(data) {
    var names = {};
    var json, n, item;

    json = JSON.parse(data);

    if (json && json.results) {
      for (n = 0; n < json.results.length; n++) {
        item = json.results[n];
        if (item.hostname && !item.hostname.match(/\baka\b/)) {
          names[item.hostname] = item;
        }
      }
    }

    return names;
}

/*
 *  load from JSON file
 */
function load(hostsUrl, callback) {
  var parsedUrl = url.parse(hostsUrl);

  if (parsedUrl.protocol === null || parsedUrl.protocol === 'file:') {
    util.log("loading " + parsedUrl.pathname);
    fs.readFile(parsedUrl.pathname, function (err, data) {
      if (err) throw err;
      hosts = parse(data);
      if (callback) {
          callback(hosts);
      }
    });
  } else if ( /^http/.test(parsedUrl.protocol) ) {
    var get = parsedUrl.protocol === 'https:' ? https.get : http.get;
    util.log("requesting " + parsedUrl.href);
    get(parsedUrl.href, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk });
      res.on('end', function() {
        hosts = parse(data);
        if (callback) {
            callback(hosts);
        }
      });
    });
  }
}

/*
 *  initialise
 */
exports.init = function(hostsUrl, callback) {
    hostsUrl = hostsUrl || hostsFilename;
    load(hostsUrl, callback);
    setInterval(function() { load(hostsUrl, callback) }, 1000 * 60 * 15);
};

/*
 *  check hostname is allowlisted
 */
exports.check = function (hostname) {
    return hostname in hosts;
}

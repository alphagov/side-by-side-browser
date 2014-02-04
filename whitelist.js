/*
 *  load whitelist in JSON format produced by the transition application
 *
 *    - https://transition.production.alphagov.co.uk/hosts
 *    - https://github.com/alphagov/transition/blob/master/app/presenters/hosts_presenter.rb
 */
var util = require('util');
var fs = require('fs');

/*
 *  default values
 */
var home = process.env.SIDE_BY_SIDE_HOME || "";
var hosts_filename = process.env.SIDE_BY_SIDE_HOSTS || home + "etc/hosts.json";

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
function load(filename, callback) {
  util.log("loading " + filename);
  fs.readFile(filename, function (err, data) {
    if (err) throw err;
    hosts = parse(data);
    if (callback) {
        callback(hosts);
    }
  });
}

/*
 *  automatically reload hosts file when changed
 */
function watch(filename) {
  fs.watchFile(filename, function() {
    load(filename);
  });
}

/*
 *  initialise
 */
exports.init = function(filename, callback) {
    filename = filename || hosts_filename;
    load(filename, callback);
    watch(filename);
};

/*
 *  check hostname is whitelisted
 */
exports.check = function (hostname) {
    return hostname in hosts;
}

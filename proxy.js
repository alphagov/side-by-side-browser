var http = require('http');
var https = require('https');
var zlib = require('zlib');

var Transform = function (res, remoteRes, protocol, host) {

  this.callback = function (error, data) {
    if (error) {
      console.log(error);
      res.end();
      return;
    }

    delete remoteRes.headers['content-length'];
    delete remoteRes.headers['content-encoding'];
    delete remoteRes.headers['transfer-encoding'];

    data = data.toString();
    data = data.replace(new RegExp(protocol + '://' + host, 'g'), '');
    data = data.replace(new RegExp(' target="', 'g'), ' _target="');

    remoteRes.headers['content-length'] = data.length;

    res.writeHead(remoteRes.statusCode, remoteRes.headers);
    res.end(data, 'utf8');
  };

  return this;
};

exports.Transform = Transform;

var Proxy = function (host, transform, protocol, auth, namespace) {
  var client = (protocol === "https") ? https : http;
  protocol = protocol || "http";

  this.request = function (req, res) {

    if (req.headers.rewriteHost) {
        req.headers.host = req.headers.proxy;
    } else {
        req.headers.host = host;
    }

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

    //console.log(options);
    //console.log("OPTIONS");
    console.log("OPTIONS HOST -->> ", options.headers.host);

    var remoteReq = client.request(options);

    remoteReq.on('error', console.error);

    remoteReq.on('response', function (remoteRes) {

      //remoteRes.headers.host = 'www.direct.gov.uk';
      //console.log("HEADERS", remoteRes.headers);
      console.log("STATUS", remoteRes.statusCode);

      if (remoteRes.headers.location && req.headers.rewriteHost) {
        console.log("rewriteHost is TRUE");
        console.log(req.headers.rewriteHost);
        //remoteRes.headers.location = req.headers.proxy;
        //remoteRes.headers.location = 'http://www.gov.uk';
        console.log("Changed Headers -->> ", remoteRes.headers);
      } else if (remoteRes.headers.location) {
        console.log("HEADERS -->> ", remoteRes.headers);
        remoteRes.headers.location = remoteRes.headers.location.replace(new RegExp("^" + protocol + "://" + host, "g"), '');
      }

      if (transform && (remoteRes.headers['content-type'] || "").match(/^text\/html/)) {
        var buffer = [];
        delete remoteRes.headers['content-length'];

        remoteRes.on('data', function (data) {
          buffer.push(data);
        });

        remoteRes.on('end', function () {
          var data = Buffer.concat(buffer);
          var transform = new Transform(res, remoteRes, protocol, host);

          switch (remoteRes.headers['content-encoding']) {
          case 'gzip':
            zlib.gunzip(data, transform.callback);
            break;
          case 'deflate':
            zlib.deflate(data, transform.callback);
            break;
          default:
            transform.callback(null, data);
            break;
          }
        });
      } else {
        res.writeHead(remoteRes.statusCode, remoteRes.headers);
        remoteRes.on('data', function (data) {
          res.write(data);
        });
        remoteRes.on('end', function () {
          res.end();
        });
      }
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

exports.Proxy = Proxy;

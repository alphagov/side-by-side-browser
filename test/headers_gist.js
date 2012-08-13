#!/usr/bin/env node

var http = require('http');

var options = {
	hostname: 'dummy.preview.alphagov.co.uk',
	port: 80,
	path: '/en/Motoring/index.htm',
	headers: {
		host: 'www.direct.gov.uk'
	},
	method: 'GET'
};

var req = http.request(options, function(res) {

	console.log('Status: ', res.statusCode);
	console.log(res.headers);

	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log(chunk);
	});
});

// send request data
req.on('error', function(e) {
	console.log('problem with request: ' + e.message);
});
req.end();

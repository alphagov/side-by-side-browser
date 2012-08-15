#!/usr/bin/env node

var http = require('http');
var client = http.createClient(80, 'dummy.preview.alphagov.co.uk');

var request = client.request('GET', '/en/Motoring/index.htm', 
	{'host': 'www.direct.gov.uk'});

request.end();

request.on('response', function (response) {
  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

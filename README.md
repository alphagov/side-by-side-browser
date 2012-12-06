## Side-by-side Browser

Simple node.js proxy to serve a side-by-side browser and a site being reviewed under on the same domain, so the side-by-side browser is 'live' and not blocked by Same-Origin-Policy.

    $ node server.js

#### Run the tests

    $ npm install
    $ npm test

#### Setup Nginx to supply headers

The proxy can be used to serve, subject to headers, For example to proxy www.direct.gov.uk on explore-dg.dev.gov.uk:

    upstream explore-dg.dev.gov.uk-proxy {
        server localhost:3023;
    }

    server {
      server_name explore-dg.dev.co.uk ;

      listen 80;

      proxy_set_header Host $http_host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-Server $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_redirect off;

      access_log /var/log/nginx/explore-dg.dev.co.uk-access.log timed_combined;
      error_log /var/log/nginx/explore-dg.dev.co.uk-error.log;

      location / {
        proxy_pass http://explore-dg.dev.co.uk-proxy;
      }

      # headers to proxy DirectGov
      proxy_set_header X-Explore-Title DirectGov;
      proxy_set_header X-Explore-Upstream www.direct.gov.uk;
      proxy_set_header X-Explore-Redirector redirector.dev.gov.uk;
    }

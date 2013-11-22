## Side-by-side Browser

Proxy a web site to preview redirections ahead of it being transitioned to GOV.UK.

    $ node server.js

#### Run the tests

    $ npm install
    $ npm test

#### Setup Nginx to supply headers

The app serves the single host configured in server.js, but an Nginx proxy may be used to allow a single server to review multiple hosts.

For example to proxy www.direct.gov.uk on directgov.redirector.dev.gov.uk add the following to nginx.conf:

    upstream directgov.dev.gov.uk-proxy {
        server localhost:3023;
    }

    server {
      server_name directgov.dev.co.uk ;

      listen 80;

      proxy_set_header Host $http_host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-Server $host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_redirect off;

      access_log /var/log/nginx/directgov.dev.co.uk-access.log timed_combined;
      error_log /var/log/nginx/directgov.dev.co.uk-error.log;

      location / {
        proxy_pass http://directgov.dev.co.uk-proxy;
      }

      # headers to proxy DirectGov
      proxy_set_header X-Explore-Title DirectGov;
      proxy_set_header X-Explore-Upstream www.direct.gov.uk;
      proxy_set_header X-Explore-Redirector redirector.dev.gov.uk;
    }

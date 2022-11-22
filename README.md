# Side-by-side browser

**Side-by-side browser has been retired and is no longer a part of GOV.UK Transition. It was retired due to the extremely low usage, being years after [the transition project](https://insidegovuk.blog.gov.uk/2014/12/19/300-websites-to-just-1-in-15-months/), which no longer justified the effort to maintain it.**

Proxy a web site to preview redirections ahead of it being transitioned to GOV.UK.

[![sketchy explanation](http://farm3.staticflickr.com/2831/12187616853_d4b6008b5f_z.jpg "sketchy explanation")](http://www.flickr.com/photos/psd/12187616853)

## Run the tests

    $ npm install
    $ npm test

## Development

    $ node server.js

...then you can use [nip.io](http://xip.io/) to make it work with localhost, eg:

http://www.justice.gov.uk.side-by-side.127.0.0.1.nip.io:3023/__/#/

## Installation

Run the server on Heroku. It requires a `side-by-side` wildcard subdomain pointed to it:

    $ heroku domains:add *.side-by-side.publishing.service.gov.uk

Follow the returned instructions to CNAME the wildcard to Heroku.

By default, the application will take its list of allowed domains from the production
instance of the GOV.UK Transition tool. This can be overridden with the `SIDE_BY_SIDE_HOSTS`
environment variable. Examples:

- `SIDE_BY_SIDE_HOSTS=https://transition.publishing.service.gov.uk/hosts` (the default)
- `SIDE_BY_SIDE_HOSTS=file:etc/hosts.json`
- `SIDE_BY_SIDE_HOSTS=https://example.com/hosts`

#!/bin/sh
export PORT=8096
export REWRITER_HOST='www.direct.gov.uk'
export UPSTREAM_PROTOCOL='http'
export UPSTREAM_HOST='reviewomatic.dev.gov.uk'
export API_HOST='dummy.preview.alphagov.co.uk'
export API_PROTOCOL='http'

# Don't need this in Dev but must set it to run app.
export UPSTREAM_AUTH='username:password'

# Don't need this in Dev but must set it to run app.
export API_AUTH='username:password'

node server.js

review-o-matic-explore
======================

Simple node.js proxy to serve the review-o-matic and the site under review on the same domain, so the side-by-side browser is 'live' and not blocked by Same-Origin-Policy.

    export PORT=8096

    export PROXY_HOST='reviewomatic.production.alphagov.co.uk'
    export PROXY_AUTH='username:password'

    export UPSTREAM_HOST='www.direct.gov.uk'

    node proxy.js

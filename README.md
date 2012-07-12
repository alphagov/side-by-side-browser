review-o-matic-explore
======================

Simple node.js proxy to serve the review-o-matic and the site under review on the same domain, so the side-by-side browser is 'live' and not blocked by Same-Origin-Policy.

    export PORT=8096

    export REWRITER_HOST='www.direct.gov.uk'

    export UPSTREAM_HOST='reviewomatic.production.alphagov.co.uk'
    export UPSTREAM_AUTH='username:password'

    export API_HOST='migratorator.production.alphagov.co.uk'

    node proxy.js

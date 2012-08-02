## review-o-matic-explore

Simple node.js proxy to serve the review-o-matic and the site under review on the same domain, so the side-by-side browser is 'live' and not blocked by Same-Origin-Policy.

    export PORT=8096

    export REWRITER_HOST='www.direct.gov.uk'

    export UPSTREAM_PROTOCOL='https'
    export UPSTREAM_HOST='reviewomatic.production.alphagov.co.uk'
    export UPSTREAM_AUTH='username:password'

    export API_HOST='migratorator.production.alphagov.co.uk'

    node server.js

#### Run the tests

    npm install
    npm test


### Running with Bowl

To run with `bowl` command create an `.env` in the `/development` directory with the following criteria:

```sh
REVIEWOMATIC_EXPLORE_PORT=3023
REWRITER_HOST=www.direct.gov.uk
UPSTREAM_PROTOCOL=http
UPSTREAM_HOST=reviewomatic.dev.gov.uk
UPSTREAM_AUTH=username:password
API_HOST=migratorator.dev.gov.uk
```

The updated Pinfile and Procfile should now contain the correct configuration to allow you to run the following command from `/development`:

```sh
bowl reviewomatic
```

This should start reviewomatic, reviewomatic-explore and migratorator - everything you need to run and view reviewomatic-explore in dev

NB: The enviroment variable `REVIEWOMATIC_EXPLORE_PORT` allows bowl/foreman to get the port from the `.env` file. 
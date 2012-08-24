## review-o-matic-explore

Simple node.js proxy to serve the review-o-matic and the site under review on the same domain, so the side-by-side browser is 'live' and not blocked by Same-Origin-Policy.

    export PORT=8096

    export REVIEWOMATIC_PROTOCOL='https'
    export REVIEWOMATIC_HOST='reviewomatic.production.alphagov.co.uk'
    export REVIEWOMATIC_AUTH='username:password'

    node server.js

#### Run the tests

    npm install
    npm test


### Running with Bowl

To run with `bowl` command create an `.env` in the `/development` directory with the following criteria:

```sh
REVIEWOMATIC_EXPLORE_PORT=3023
REVIEWOMATIC_HOST=reviewomatic.dev.gov.uk
REVIEWOMATIC_AUTH=username:password
```

The updated Pinfile and Procfile should now contain the correct configuration to allow you to run the following command from `/development`:

```sh
bowl reviewomatic
```

This should start reviewomatic, reviewomatic-explore and migratorator - everything you need to run and view reviewomatic-explore in dev

NB: The enviroment variable `REVIEWOMATIC_EXPLORE_PORT` allows bowl/foreman to get the port from the `.env` file. 

#### Migrate CSV data to Postgres

Can Process with remote file URL and file paths which are publicly accessiable.

#### Prerequisite:

-   Postgres Sql [Connection URL can pass using ENV var `POSTGRES_URL`]
-   Redis [Connection URL can pass using ENV var `REDIS_URL`] (for record keeping of processing files)

#### Improvements:

-   Use of [sequelize](https://www.npmjs.com/package/sequelize) with `pg`.
-   Use of `appolo-graphql` instead of `express-graphql`
-   Make the migration script more modular and create tables automatically, instead of manually triggering it, incase the data type is not much in concern.

#### Production Deployment:

-   Make sure `POSTGRES_URI` & `REDIS_URI` ENV vars having right connection URLs.
-   to run Migration command is: `npm start migrate`
-   to start the server with command `NODE_ENV=production npm start` in a detached terminal
    or with `PM2` the command : `pm2 start ecosystem.config.js --env production`
    also we can have the ENV vars inside the `ecosystem.config.js`

#### What can be done:

To improve performance, flexiblity and control we can make use of some multi Threading stack and tools.

I would choose Golang as its simple to write, its faster than node.js , can make use of go routines to make the application more effecient.

Can make more `redis`, as we are using it already.
we can split the migration to separate service which will be independent.

The main application will contain The graphql apis,
and all apis which are accepting the files/file Urls which are needs to be migrated to postgres.

we can extract remote URLS of the files that are provided and push it to a queue [mostly for queue we can use bull.js on top of redis]

in other hand we can pull each file link at a time in the migration service. and process it.

if fails because of the DB connection, can reschedule it in the queue.

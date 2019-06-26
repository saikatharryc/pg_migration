const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const request = require("request");
const xmlParse = require("fast-xml-parser");
const graphql = require("graphql");
const expressGraphQl = require("express-graphql");
const { GraphQLSchema } = graphql;

const { query } = require("./graphql/queries");
const migrate = require("./migration");

const { redis } = require("./conn/redis");
const config = require("./config");

const schema = new GraphQLSchema({
    query
});

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * GraphQl
 */

app.use(
    "/",
    expressGraphQl({
        schema: schema,
        graphiql: true
    })
);

/**
 * Migration script call
 */

const migration = () => {
    /**
     * Create all Tables
     */
    require("./conn/pg")
        .createTables()
        .then(d => {
            console.log("<<< Tables setup done >>>");
        })
        .catch(e => {
            console.log("<<< Failed to setup tables >>>");
            throw e;
        });
    /**
     * Pull file URI from GCP and process
     */
    request.get(config.GCP_STORAGE_BASE, (e, d) => {
        if (e) {
            throw e;
        }
        a = xmlParse.parse(d.body);
        for (const urlObj of a.ListBucketResult.Contents) {
            if (urlObj.Key.split(".").indexOf("csv") > -1) {
                const full_url = config.GCP_STORAGE_BASE + urlObj.Key;
                redis
                    .get(full_url)
                    .then(d => {
                        if (d == "true") {
                            console.log("Already processed earlier.");
                        } else {
                            console.log("processing...... " + urlObj.Key);
                            migrate(full_url, true);
                        }
                    })
                    .catch(ex => {
                        throw { err: ex, at: urlObj.Key };
                    });
            }
        }
    });
};

migration();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    const errorObj = {
        service: "migration_service"
    };
    if (err.status === 400) {
        if (err.validationErrors) {
            errorObj.validationErrors = err.validationErrors;
        }
        errorObj.message = err.message || "Invalid Values Supplied";
        errorObj.head = err.head || null;
    } else if (err.status === 401 || err.status === 403) {
        errorObj.head = err.head || null;
        errorObj.message = err.message || "Unauthorized User";
    } else if (err.status === 500) {
        errorObj.head = err.head || null;

        errorObj.message = err.message;

        errorObj.message = "Internal Server Error";
    } else if (err.status === 404) {
        errorObj.head = err.head || null;
        errorObj.message = err.message;
    } else {
        errorObj.head = err.head || null;

        errorObj.message = err.message || "Unknown Error Occurred";
    }

    next();

    return res.status(err.status || 500).json(errorObj);
});

process.on("SIGTERM", function() {
    //do something before Gracefully shut it down
    process.exit(0);
});
process.on("SIGINT", function() {
    //do something before Gracefully shut it down
    process.exit(0);
});

module.exports = app;

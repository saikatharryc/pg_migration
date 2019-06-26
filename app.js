const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const graphql = require("graphql");
const expressGraphQl = require("express-graphql");
const { GraphQLSchema } = graphql;
const { query } = require("./graphql/queries");

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
        graphiql: process.env["NODE_ENV"] == "development" ? true : false
    })
);

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

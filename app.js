const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const request = require("request");
const xmlParse = require("fast-xml-parser");

const migrate = require("./migration");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const config = require("./config");
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

/**
 * Create all Tables
 */
// require("./db/pg")
//     .createTables()
//     .then(d => {
//         console.log("<<< Tables setup done >>>");
//     })
//     .catch(e => {
//         console.log("<<< Failed to setup tables >>>");
//         throw e;
//     });

request.get(config.GCP_STORAGE_BASE, (e, d) => {
    if (e) {
        throw e;
    }
    a = xmlParse.parse(d.body);
    for (const urlObj of a.ListBucketResult.Contents) {
        if (urlObj.Key.split(".").indexOf("csv") > -1) {
            console.log(urlObj.Key);
            migrate(config.GCP_STORAGE_BASE + urlObj.Key);
        }
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;

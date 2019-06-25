var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fs = require("fs");
const { Pool, Client } = require("pg");
const copyFrom = require("pg-copy-streams").from;
const config = require("./config");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

/**
 * All scripts lets put here for now
 */

var inputFile = path.join(__dirname, "/sample.csv");
var table = "postgres";

const conString = config.POSTGRES_URI;
const client = new Client({
  connectionString: conString
});

client.connect();
const executeQuery = targetTable => {
  const execute = (target, callback) => {
    client.query(`Truncate ${target}`, err => {
      if (err) {
        client.end();
        callback(err);
        // return console.log(err.stack)
      } else {
        console.log(`Truncated ${target}`);
        callback(null, target);
      }
    });
    // callback(null, target);
  };
  execute(targetTable, err => {
    if (err) return console.log(`Error in Truncate Table: ${err}`);
    var stream = client.query(
      copyFrom(
        `COPY ${targetTable} FROM STDIN (FORMAT csv, HEADER, DELIMITER ',')`
      )
    );
    var fileStream = fs.createReadStream(inputFile);

    fileStream.on("error", error => {
      console.log(`Error in creating read stream ${error}`);
    });
    stream.on("data", data => {
      console.log(data);
    });
    stream.on("error", error => {
      console.log(`Error in creating stream ${error}`);
    });
    stream.on("end", () => {
      console.log(`Completed loading data into ${targetTable}`);
      client.end();
    });
    fileStream.pipe(stream);
  });
};
// Execute the function
executeQuery(table);

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

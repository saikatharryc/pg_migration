const copyFrom = require("pg-copy-streams").from;
const request = require("request");
const { client } = require("../db/pg");

const table = "postgres";
// const fs = require("fs");

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
};

module.exports = (inputFile, targetTable = table) => {
    execute(targetTable, err => {
        if (err) return console.log(`Error in Truncate Table: ${err}`);
        var stream = client.query(
            copyFrom(
                `COPY ${targetTable} FROM STDIN (FORMAT csv, HEADER, DELIMITER ',')`
            )
        );
        var fileStream = request.get(inputFile);

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
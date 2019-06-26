const copyFrom = require("pg-copy-streams").from;
const request = require("request");
const fs = require("fs");
const { client } = require("../conn/pg");
const { redis } = require("../conn/redis");

const table = "assignm_t_1";
// const fs = require("fs");

const execute = (target, callback) => {
    client.query(`Truncate ${target}`, err => {
        if (err) {
            client.end();
            callback(err);
        } else {
            console.log(`Truncated ${target}`);
            callback(null, target);
        }
    });
};

module.exports = (inputFile, uri = true, targetTable = table) => {
    /* Before processing , Put a record to redis */
    redis.set(inputFile, "false");
    execute(targetTable, err => {
        if (err) return console.log(`Error in Truncate Table: ${err}`);
        var stream = client.query(
            copyFrom(
                `COPY ${targetTable} FROM STDIN (FORMAT csv, HEADER, DELIMITER ',')`
            )
        );
        if (uri) {
            //incase file is loading from URI
            var fileStream = request.get(inputFile);
        } else {
            //Incase its a file path
            var fileStream = fs.createReadStream(inputFile);
        }

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
            /* Once file processed mark the record as completed */
            redis.set(inputFile, "true");
            console.log(`Completed loading data into ${targetTable}`);
            client.end();
        });
        fileStream.pipe(stream);
    });
};

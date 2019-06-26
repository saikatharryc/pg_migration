const request = require("request");
const xmlParse = require("fast-xml-parser");
const pgInstance = require("../conn/pg");
const migrate = require("../migration");

const { redis } = require("../conn/redis");
const config = require("../config");

/**
 * Migration script call
 */

const migration = () => {
    /**
     * Create all Tables
     */
    pgInstance
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
                return redis
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
                        console.log(">>>>>>>>>>>");
                        throw { err: ex, at: urlObj.Key };
                    });
            }
        }
    });
};

migration();

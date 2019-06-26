const { Client } = require("pg");
const config = require("../config");

const conString = config.POSTGRES_URI;
const client = new Client({
    connectionString: conString
});

client.connect();

const createTables = () => {
    return Promise.all([
        client.query(`
    CREATE TABLE IF NOT EXISTS assignm_t_1 (
        token_address VARCHAR,
         from_address VARCHAR,
         to_address VARCHAR,
         value VARCHAR,
         transaction_hash VARCHAR,
         log_index VARCHAR,
         block_timestamp VARCHAR,
         block_number VARCHAR,
         block_hash VARCHAR
        )
      `),
        client.query(`
    CREATE TABLE  IF NOT EXISTS assignm_t_2 (
        address VARCHAR,
        symbol VARCHAR,
        name VARCHAR,
        decimals INT,
        total_supply VARCHAR
    )`)
    ]);
};
module.exports = { client, createTables };

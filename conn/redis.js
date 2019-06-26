const Redis = require("ioredis");
const config = require("../config");
const redis = new Redis(config.REDIS_URI);

redis.on("connected", c => {
    console.log("Redis connected!");
});
redis.on("error", e => {
    console.log("++++++++++\n" + e + "\n++++++++++");
    process.exit(0);
});
module.exports = { redis };

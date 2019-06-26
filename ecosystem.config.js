module.exports = {
    apps: [
        {
            name: "pg_migration",
            script: "./bin/www",
            env: {
                NODE_ENV: "development",
                POSTGRES_URI: "<CONNECTION URL>",
                REDIS_URI: "<CONNECTION URL>"
            },
            env_production: {
                NODE_ENV: "production",
                POSTGRES_URI: "<CONNECTION URL>",
                REDIS_URI: "<CONNECTION URL>"
            }
        }
    ]
};

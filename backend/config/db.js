const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "9MVisD",
    password: "gre_Dishi_post29",
    port: 5432,
});

module.exports = pool;


const { Pool, Client } = require('pg');

const pool = new Pool({
    user: "postgres",
    password: "sql@123",
    host: "localhost",
    post: 5432,
    database: "farmers"
});

module.exports = pool;
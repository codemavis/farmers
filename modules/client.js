
const { Pool, Client } = require('pg');

const pool = new Pool({
    user: "uzzfawud",
    password: "Vmn5ZMCXsSuKKJTy8mHb9dMvxSJr1ide",
    host: "fanny.db.elephantsql.com",
    post: 5432,
    database: "uzzfawud",
    ssl: { rejectUnauthorized: false }
});

// const pool = new Pool({
//     user: "postgres",
//     password: "sql@123",
//     host: "localhost",
//     post: 5432,
//     database: "farmers"
// });

module.exports = pool;

const { Pool, Client } = require('pg');

// const pool = new Pool({
//     user: "zizfwtbbzbhyhj",
//     password: "0e698de835a83b7b2e1f846222c93e51f6e5ab4ea0cfc34ebfd9fd3ec2d48699",
//     host: "ec2-50-17-255-244.compute-1.amazonaws.com",
//     post: 5432,
//     database: "dhpu3q9v4hnj6",
//     ssl: { rejectUnauthorized: false }
// });

const pool = new Pool({
    user: "postgres",
    password: "sql@123",
    host: "localhost",
    post: 5432,
    database: "farmers"
});

module.exports = pool;
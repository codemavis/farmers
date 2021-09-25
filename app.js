"use strict";
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');


app.use(cors());
app.use(express.json());

const user = require('./routes/user.routes');
const province = require('./routes/province.routes');
const auth = require('./routes/auth.routes');
const products = require('./routes/products.routes');
const farmers = require('./routes/farmers.routes');

app.use('/user', user);
app.use('/auth', auth);
app.use('/farmers', farmers);
app.use('/province', province);
app.use('/products', products);

app.get('/', (req, res) => {
    //handle root
    res.send("hi root: " + req.connection.remoteAddress);
});

app.listen(port, err => {
    if (err) return console.log("ERROR", err);
    console.log(`Listening on port ${port}`);
});

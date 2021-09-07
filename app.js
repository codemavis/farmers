"use strict";
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');


app.use(cors());
app.use(express.json());

const user = require('./routes/user.routes');
const auth = require('./routes/auth.routes');

app.use('/user', user);
app.use('/auth', auth);

app.get('/', (req, res) => {
    //handle root
    res.send("hi root: " + req.connection.remoteAddress);
});

app.listen(port, err => {
    if (err) return console.log("ERROR", err);
    console.log(`Listening on port ${port}`);
});

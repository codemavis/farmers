"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const products = require('../controllers/products.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(dataAction.authenticateToken, products.findAll)

router
    .route('/:productId')
    .get(dataAction.authenticateToken, products.findOne)


module.exports = router;
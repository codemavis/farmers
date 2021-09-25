"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const province = require('../controllers/province.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(dataAction.authenticateToken, province.findAll)

router
    .route('/:provinceId')
    .get(dataAction.authenticateToken, province.findOne)


module.exports = router;
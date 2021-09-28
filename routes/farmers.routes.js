"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const farmers = require('../controllers/farmers.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(dataAction.authenticateToken, farmers.findAll)
    .post(dataAction.authenticateToken, farmers.create)

router
    .route('/analysis')
    .get(dataAction.authenticateToken, farmers.analyse)

router
    .route('/:farmerId')
    .get(dataAction.authenticateToken, farmers.findOne)
    .put(dataAction.authenticateToken, farmers.update)
    .delete(dataAction.authenticateToken, farmers.delete)


module.exports = router;
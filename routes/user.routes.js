"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const user = require('../controllers/user.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(dataAction.authenticateToken, user.findAll)
    .post(user.create); //dataAction.authenticateToken,

router
    .route('/curruser')
    .get(dataAction.authenticateToken, user.findCurrent)

router
    .route('/:userid')
    .get(dataAction.authenticateToken, user.findOne)
    .put(dataAction.authenticateToken, user.update)
    .delete(dataAction.authenticateToken, user.delete);

router
    .route('/email/:emailid')
    .get(user.findOneByEmail) //For login

module.exports = router;
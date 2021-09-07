"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const auth = require('../controllers/auth.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(auth.handleRoot)

router
    .route('/login')
    .post(auth.loginUser)

router
    .route('/token')
    .post(auth.getToken)

router
    .route('/password_reset')
    .post(auth.passwordReset)

router
    .route('/reset')
    .post(auth.reset)


router
    .route('/logout')
    .delete(auth.logoutUser)


module.exports = router;
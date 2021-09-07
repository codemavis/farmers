require('dotenv').config();
const client = require('../modules/client');

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const dataAction = require('../modules/dataaction');
const user = require('../controllers/user.controller');

const senderEmail = 'madolahasarel95@gmail.com';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: senderEmail, // Send email
        pass: 'beyckkreyjgskqup' // App Password
    }
});

app.use(cors());
app.use(express.json());

exports.handleRoot = (req, res) => {
    //handle root
    res.send("hi root auth: " + req.connection.remoteAddress);
}

exports.loginUser = async (req, res) => {
    const currUser = await user.findOneByEmail(req.body.email)
    if (currUser == null) return res.status(400).send({
        code: 'ERROR',
        message: 'Unauthorized access'
    });

    try {
        if (await dataAction.compareHash(req.body.password, currUser.password)) {
            const jwtUser = {
                userid: currUser.recordid,
                firstname: currUser.firstname,
                lastname: currUser.lastname,
                email: currUser.email
            };

            const accessToken = generateAccessToken(jwtUser);
            const refreshToken = jwt.sign(jwtUser, process.env.REFRESH_TOKEN_SECRET);

            let isSaved = await saveRefreshToken(jwtUser.userid, refreshToken);
            console.log('isSaved', isSaved);

            res.json({
                code: 'OK',
                message: 'Logged in successfully',
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } else
            res.json({
                code: 'ERROR',
                message: 'Unauthorized Access'
            });
    } catch (error) {
        res.status(500).send({
            code: 'ERROR',
            message: error.message
        });
    }
}

const generateAccessToken = (currUser) => {
    return jwt.sign(currUser, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' }); //15s
}

exports.getToken = async (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);

    let isAvailable = await checkRefreshToken(refreshToken);
    if (!isAvailable) return res.status(403).send({ code: 'ERROR', message: 'Invalid Refresh Token' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, currUser) => {
        if (err) return res.sendStatus(403);

        const accessToken = generateAccessToken(currUser);
        res.json({ code: 'OK', message: 'Success', accessToken: accessToken });
    });
}

exports.logoutUser = async (req, res) => {
    try {
        let result = await client.query(`UPDATE authuser SET isactive=false WHERE refreshtoken='${req.body.token}'`);
        console.log('result', result);
        res.json({ code: 'OK', message: 'Success', logout: true });
    } catch (err) {
        console.log('logout error', err.message);
        res.json({ code: 'ERROR', message: 'Fail', logout: true });
    }
}

const checkRefreshToken = async (refreshToken) => {
    try {
        let result = await client.query(`SELECT recordid,user FROM authuser WHERE refreshtoken='${refreshToken}' AND isactive=true`);
        console.log('result.rows.rowCount', result.rows.length);
        return result.rows.length;

    } catch (err) {
        console.log('findAll error', err.message);
    }
    return null;
}

const saveRefreshToken = async (userId, refreshToken) => {
    try {
        let result = await client.query(`INSERT INTO authuser("user", refreshtoken, isactive) VALUES (${userId}, '${refreshToken}', true)`);
        console.log('result.rows', result.rows);
        return result.rows;
    } catch (err) {
        console.log('findAll error', err.message);
    }
}

exports.passwordReset = async (req, res) => {

    if (req.body.resettoken && req.body.email) {
        const currUser = await user.findOneByEmail(req.body.email);

        const currDate = Date.now();

        if (req.body.resettoken == currUser.resettoken) {
            if (parseFloat(currDate) <= parseFloat(currUser.expiretoken))
                res.json({ code: 'OK', message: 'OTP Validation Success' });
            else
                res.json({ code: 'OK', message: 'OTP Epired' });
        }
        res.json({ code: 'ERROR', message: 'Invalid Token' });
    }

}

exports.reset = async (req, res) => {

    crypto.randomBytes(32, async (err, buffer) => {
        if (err) console.log('crypto err', err.message);

        const token = buffer.toString("hex").substr(0, 16).toUpperCase();
        const expireToken = Date.now() + 300000; //5 mins

        try {

            const currUser = await user.findOneByEmail(req.body.email);

            if (!currUser) res.json({ code: 'ERROR', message: 'Invalid Email Address' });

            let result = await client.query(`UPDATE "user" SET resettoken='${token}', expiretoken=${expireToken} WHERE email = '${req.body.email}'`);
            console.log('result.rows', result.rows);
            if (result.rows) {

                transporter.sendMail({
                    to: req.body.email,
                    from: senderEmail,
                    subject: '[farmers.lk] Please reset your password',
                    html: `<p>We heard that you lost your farmers.lk password. Sorry about that!</p>
                    <br/>
                    <p>But don’t worry! You can use the following OTP to reset your password:</p>
                    <br/>
                    <p>${token}</p>
                    <br/>
                    <p>If you don’t use this OTP within 5 mins, it will expire. </p>
                    <br/>
                    <br/>
                    <p>Thanks,</p>
                    <p>The Farmers Team</p>`
                }).then(() => {
                    res.json({ code: 'OK', message: 'Email Sent' });
                }).catch((error) => {
                    res.json({ code: 'ERROR', message: error.message });
                });
            }

        } catch (error) {
            res.json({ code: 'OK', message: error.message });
        }
    });


}
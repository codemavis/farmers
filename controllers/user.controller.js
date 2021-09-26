const dataAction = require('../modules/dataaction');

let dataFile = 'user';
let logFile = 'luser';

exports.create = async (req, res) => {
    try {
        let objUser = req.body;
        console.log('objUser.password', objUser.password);
        objUser.password = await dataAction.hashStr(objUser.password);

        console.log('objUser.password', objUser.password);

        let qStr = await dataAction.dataPut(dataFile, objUser, req);
        console.log('qStr',qStr)
        let newUser = await dataAction.executeQuery(qStr);

        console.log('newUser', newUser)
        res.json({ code: 'ok', message: 'User successfully saved', recordid: newUser.rows[0].recordid });
    } catch (err) {
        console.log('create error', err.message);
        res.status(500).send({ code: 'error', message: err.message });
    }
}

exports.findAll = async (req, res) => {
    try {
        let query = 'SELECT recordid,name,nic,province,mobile,email,empid FROM public."user";';
        result = await dataAction.executeQuery(query);
        res.send(result.rows);
    } catch (err) {
        console.log('findAll error', err.message);
    }
}

exports.findOne = async (req, res) => {
    try {
        let result = await dataAction.executeQuery(`SELECT recordid, name, nic, province, mobile, email, 
        password, empid,'' AS password FROM "${dataFile}" WHERE recordid = ${req.params.userid}`);
        res.send(result.rows[0]);
    } catch (err) {
        console.log('findOne error', err.message);
    }
}

exports.findOneByEmail = async (email) => {
    try {
        let result = await dataAction.executeQuery(`SELECT * FROM "user" WHERE email = '${email}'`);
        return await result.rows[0];
    } catch (err) {
        console.log('findOneByEmail error', err.message);
        return err.message;
    }
}

exports.update = async (req, res) => {
    try {
        //  if (await updLog(req, 'E')) {
        req.body.password = await dataAction.hashStr(req.body.password);
        let qStr = await dataAction.dataUpd(dataFile, req.body, req.params.userid);

        console.log('qStr', qStr);
        let updUser = await dataAction.executeQuery(qStr);
        res.json({ code: 'ok', message: `${updUser.rowCount} row/s affected` });
        // }
    } catch (err) {
        console.log('update error', err.message);
        res.json({ code: 'error', message: err.message });
    }
}

exports.delete = async (req, res) => {

    try {
        let result = await _checkMasterData(req.params.userid);
        console.log('result', result);

        // if (await updLog(req, 'D')) {
        let isDeleted = await dataAction.executeQuery(`DELETE FROM "${dataFile}" WHERE recordid=${req.params.userid}`);
        if (isDeleted.rowCount) {
            res.json({ code: 'ok', message: 'Deleted Successfully' });
        }
        // }

        res.json({ code: 'error', message: 'Unable to delete, please contact administrator' });
    } catch (error) {
        res.json({ 'error': error, message: error.message });
    }
}

exports.findCurrent = (req, res) => {
    try {
        console.log('req.user', req.user);
        res.send({ code: 'ok', message: 'Success', user: req.user });
    } catch (error) {
        console.log('findCurrent error', err.message);
        res.send({ code: 'error', message: err.message, user: null });
    }
}

exports.resetPwd = (req, res) => {
    try {
        console.log('req.user', req.user);
        res.send({ code: 'ok', message: 'Success', user: req.user });
    } catch (error) {
        console.log('findCurrent error', err.message);
        res.send({ code: 'error', message: err.message, user: null });
    }
}

const _checkMasterData = async (userid) => {

    try {
        let result = await dataAction.executeQuery(`SELECT table_name FROM information_schema.columns WHERE column_name = 'user'`);
        for (let i = 0; i < result.rows.length; i++) {
            let db = result.rows[i];
            let qres = await dataAction.executeQuery(`SELECT user FROM ${db.table_name} WHERE user='${userid}'`);
            if (qres.rows.length) return ({ code: 'error', message: `Unable to delete since it has dependant records` });
        }
        return false;
    } catch (error) {
        console.log('error _checkMasterData', error);
        return { code: 'error', message: error.message }
    }
}
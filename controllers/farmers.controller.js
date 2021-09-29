const dataAction = require('../modules/dataaction');
const groupArray = require('group-array');

let dataFile = 'farmers';
let logFile = 'lfarmers';

exports.create = async (req, res) => {
    try {
        const { products, ...objFarmer } = req.body;

        let qStr = await dataAction.dataPut(dataFile, objFarmer, req)
            , newFarmer = await dataAction.executeQuery(qStr);

        products.map(async (prod) => {
            let { selectedProduct, ...objProd } = prod;
            objProd.farmer = newFarmer.rows[0].recordid;
            let qProdStr = await dataAction.dataPut('farmerproduct', objProd, req)
                , newFarmerProduct = await dataAction.executeQuery(qProdStr);
        })

        console.log('newFarmer', newFarmer)
        res.json({ code: 'ok', message: 'Farmer successfully saved', recordid: newFarmer.rows[0].recordid });
    } catch (err) {
        console.log('create error', err.message);
        res.status(500).send({ code: 'error', message: err.message });
    }
}

exports.findAll = async (req, res) => {
    try {
        let query = 'SELECT recordid, name, "user", nic, mobile, experienceyears, newproduct FROM public.farmers;';
        result = await dataAction.executeQuery(query);

        for (let i = 0; i < result.rows.length; i++) {
            let farmerProd = await dataAction.executeQuery(`SELECT product, quantity, growarea,profit,lost,
                sellingpricekilo,cannotsellqty FROM farmerproduct WHERE farmer = ${result.rows[i].recordid}`);
            result.rows[i].products = farmerProd.rows;

        }
        res.send(result.rows);
    } catch (err) {
        console.log('findAll error', err.message);
    }
}

exports.findOne = async (req, res) => {
    try {
        console.log('farmerId', req.params.farmerId)
        let result = await dataAction.executeQuery(`SELECT name, "user", nic, mobile, experienceyears,
            newproduct FROM public.farmers WHERE recordid = ${req.params.farmerId}`);

        if (result.rows.length <= 0) res.send({});

        let farmerProd = await dataAction.executeQuery(`SELECT product,quantity, growarea,profit,lost,
                sellingpricekilo,cannotsellqty FROM farmerproduct WHERE farmer = ${req.params.farmerId}`);

        let farmers = result.rows[0];
        console.log('result', result);
        console.log('farmers', farmers);
        farmers.products = [];

        farmerProd.rows.map((prod) => {
            farmers.products.push(prod);
        });

        res.send(farmers);
    } catch (err) {
        console.log('findOne error', err.message);
    }
}

exports.update = async (req, res) => {
    try {

        const { products, ...objFarmer } = req.body;


        let qStr = await dataAction.dataUpd(dataFile, objFarmer, req.params.farmerId);
        console.log('qStr', qStr);
        let updUser = await dataAction.executeQuery(qStr);

        products.map(async (prod) => {

            let { selectedProduct, ...objProd } = prod;
            objProd.farmer = newFarmer.rows[0].recordid;

            let farmerProdId = await dataAction.executeQuery(`select recordid from farmerproduct WHERE farmer=${req.params.farmerId} AND product=${objProd.product}`);

            if (farmerProdId.rows && farmerProdId.rows[0].recordid) {
                qStr = await dataAction.dataUpd('farmerproduct', objProd, farmerProdId.rows[0].recordid);
                console.log('qStr', qStr);
                updUser = await dataAction.executeQuery(qStr);
            }

        });

        console.log('updUser', updUser);
        res.json({ code: 'ok', message: `${updUser.rowCount} row/s affected` });

    } catch (err) {
        console.log('update error', err.message);
        res.json({ code: 'error', message: err.message });
    }
}

exports.analyse = async (req, res) => {
    try {
        // let response = await dataAction.executeQuery(`SELECT d.recordid as "user",d.name as user_name ,b.recordid as farmer,b.name as farmer_name,a.product,c.name as product_name,
        //     a.quantity::float+a.cannotsellqty::float as totalQty,
        //     c.consumption::float, c.consumption::float-a.quantity::float+a.cannotsellqty::float as requiredqty
        //     FROM farmerproduct a, farmers b,products c, "user" d WHERE b.recordid=a.farmer AND a.product=c.recordid 
        //     AND d.recordid = b.adduser::float AND d.recordid=${req.user.userid}`);

        let response1 = await dataAction.executeQuery(`SELECT d.name as user_name,c.name as product_name,b.name as farmer_name,
        (c.consumption::float-a.quantity::float+a.cannotsellqty::float)/2 as requiredqty
        FROM farmerproduct a, farmers b,products c, "user" d WHERE b.recordid=a.farmer AND a.product=c.recordid 
        AND d.recordid = b.adduser::float AND d.recordid=${req.user.userid}`);

        let response = await dataAction.executeQuery(`SELECT d.name as user_name,c.name as product_name,b.name as farmer_name,
        c.consumption::float-a.quantity::float+a.cannotsellqty::float as requiredqty
        FROM farmerproduct a, farmers b,products c, "user" d WHERE b.recordid=a.farmer AND a.product=c.recordid 
        AND d.recordid = b.adduser::float AND d.recordid=${req.user.userid}`);

        let result = [], finalRes = {};

        if (response.rows.length > 0) {
            // result = groupArray(response.rows, 'user_name', 'farmer_name');
            // let result1 = groupArray(response1.rows, 'user_name', 'farmer_name');

            finalRes.Yala = response1.rows;
            finalRes.Maha = response1.rows;
            finalRes.Both = response.rows;

        }

        res.send(finalRes);
    } catch (error) {
        console.log('analyse error', error);
    }
}

exports.delete = async (req, res) => {

    try {
        let result = await _checkMasterData(req.params.farmerId);
        console.log('result', result);

        // if (await updLog(req, 'D')) {
        let isDeleted = await dataAction.executeQuery(`DELETE FROM "${dataFile}" WHERE recordid=${req.params.farmerId}`);
        isDeleted = await dataAction.executeQuery(`DELETE FROM farmerproduct WHERE farmer=${req.params.farmerId}`);
        if (isDeleted.rowCount) {
            res.json({ code: 'ok', message: 'Deleted Successfully' });
        }
        // }

        res.json({ code: 'error', message: 'Unable to delete, please contact administrator' });
    } catch (error) {
        res.json({ 'error': error, message: error.message });
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
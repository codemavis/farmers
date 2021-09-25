const dataAction = require('../modules/dataaction');

let dataFile = 'farmers';
let logFile = 'lfarmers';

exports.create = async (req, res) => {
    try {
        const { products, ...objFarmer } = req.body;

        let qStr = await dataAction.dataPut(dataFile, objFarmer, req)
            , newFarmer = await dataAction.executeQuery(qStr);

        products.map(async (prod) => {
            prod.farmer = newFarmer.rows[0].recordid;
            let qProdStr = await dataAction.dataPut('farmerproduct', prod, req)
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
            let farmerProd = await dataAction.executeQuery(`SELECT quantity, growarea,profit,lost,
                sellingpricekilo,cannotsellqty FROM farmerproduct WHERE farmer = ${result.rows[i].recordid}`);
            result.rows[i].product = farmerProd.rows;

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

        let farmerProd = await dataAction.executeQuery(`SELECT quantity, growarea,profit,lost,
                sellingpricekilo,cannotsellqty FROM farmerproduct WHERE farmer = ${req.params.farmerId}`);

        let farmers = result.rows[0];
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
        let qStr = await dataAction.dataUpd(dataFile, req.body, req.params.farmerId);

        console.log('qStr', qStr);
        let updUser = await dataAction.executeQuery(qStr);
        res.json({ code: 'ok', message: `${updUser.rowCount} row/s affected` });

    } catch (err) {
        console.log('update error', err.message);
        res.json({ code: 'error', message: err.message });
    }
}

exports.delete = async (req, res) => {

    try {
        let result = await _checkMasterData(req.params.farmerId);
        console.log('result', result);

        // if (await updLog(req, 'D')) {
        let isDeleted = await dataAction.executeQuery(`DELETE FROM "${dataFile}" WHERE recordid=${req.params.farmerId}`);
        if (isDeleted.rowCount) {
            res.json({ code: 'ok', message: 'Deleted Successfully' });
        }
        // }

        res.json({ code: 'error', message: 'Unable to delete, please contact administrator' });
    } catch (error) {
        res.json({ 'error': error, message: error.message });
    }
}

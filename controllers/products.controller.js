const dataAction = require('../modules/dataaction');

let dataFile = 'products';
let logFile = 'lproducts';


exports.findAll = async (req, res) => {
    try {
        let query = `SELECT * from ${dataFile};`;
        result = await dataAction.executeQuery(query);
        res.send(result.rows);
    } catch (err) {
        console.log('findAll error', err.message);
    }
}

exports.findOne = async (req, res) => {
    try {
        let result = await dataAction.executeQuery(`SELECT * from ${dataFile} WHERE recordid = ${req.params.productId}`);
        res.send(result.rows[0]);
    } catch (err) {
        console.log('findOne error', err.message);
    }
}

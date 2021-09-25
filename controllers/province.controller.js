const dataAction = require('../modules/dataaction');

let dataFile = 'province';
let logFile = 'lprovince';


exports.findAll = async (req, res) => {
    try {
        let query = `SELECT recordid, name from ${dataFile};`;
        result = await dataAction.executeQuery(query);
        res.send(result.rows);
    } catch (err) {
        console.log('findAll error', err.message);
    }
}

exports.findOne = async (req, res) => {
    try {
        let result = await dataAction.executeQuery(`SELECT recordid, name from ${dataFile} WHERE recordid = ${req.params.provinceId}`);
        res.send(result.rows[0]);
    } catch (err) {
        console.log('findOne error', err.message);
    }
}

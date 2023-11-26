const mysql = require('mysql');
const config = require('../config');

const connection = mysql.createConnection(config.mysql);

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');
});

module.exports = connection;

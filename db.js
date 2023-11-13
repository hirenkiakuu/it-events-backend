const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql
.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
});

pool.getConnection((err, connection) => {
    if (err) {
        console.log('Error connecting to the database', err);
    } else {
        console.log('Succesfully connected to the database');
        connection.release();
    }
});


module.exports = pool.promise();

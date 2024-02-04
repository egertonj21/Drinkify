// const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');

// const dbConnection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     port: '3306',
//     database: 'drink'
// });

const pool = mysqlPromise.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'drink'
});

// dbConnection.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Database connection successful');
// });

module.exports = pool;

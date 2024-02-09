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

pool.query('SELECT * FROM user')
    .then(([rows, fields]) => {
        console.log('Database connection successful');
        console.log(rows);
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
    });


module.exports = pool;

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'drink'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Database connection successful')
})

module.exports = db;
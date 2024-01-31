const express = require('express');
const conn = require('../utils/dbconn');
const router = express.Router();
router.get('/', (req, res) => {

const selectSQL = 'SELECT * FROM runschedule';
conn.query(selectSQL, (err, rows) => {
if (err) {
throw err;
} else {
res.render('index', { schedule: rows });
}
});
});

module.exports = router;
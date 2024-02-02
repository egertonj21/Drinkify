const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config({ path: './config.env' });
const session = require('express-session');
const router = require('./routes/scheduleroutes.js');
const path = require('path');

const app = express();

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 3600000}    
}));


app.set('view engine', 'ejs');

app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use('/', router);

app.listen(process.env.PORT, (err) => {
if (err) return console.log(err);
console.log(`Express listening on port ${process.env.PORT}`);
});
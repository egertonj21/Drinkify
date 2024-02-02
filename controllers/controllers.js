const db = require('./../utils/dbconn');

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {data: null});
};

exports.getAddDrinkRoute =(req, res) =>{
    if(req.session.isLoggedIn == true) {
        const querySQL = `SELECT * FROM ingredient`;

        db.query(querySQL, (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
                return;
            }
            console.log(rows);
            res.render('addDrink', { data: rows, role: req.session.role });
        });
    } else {
        res.render('login', {error: 'You must first log in'});
    }
};

exports.getCabinetRoute = (req, res) => {
    if(req.session.isLoggedIn == true) {
        const selectSQL = `SELECT ingredientName FROM user 
                           INNER JOIN useringredient ON user.userID = useringredient.userID 
                           INNER JOIN ingredient ON useringredient.ingredientID = ingredient.ingredientID`;

        db.query(selectSQL, (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
                return;
            }
            console.log(rows);
            res.render('cabinet', { data: rows, role: req.session.role });
        });
    } else {
        res.render('cabinet', {error: 'You must first log in'});
    }
};

// exports.getCabinetRoute =(req, res) => {
//     res.render('cabinet');
// };

exports.getRegisterRoute =(req, res) => {
    res.render('register');
};

exports.getLoginRoute = (req, res) => { // Corrected route definition
    res.render('login', {error: ''});
};

exports.postLoginRoute = (req, res) => { // Corrected route definition
    const {email, password} = req.body;
    console.log(`${email} ${password}`);

    const vals = [email, password];
    const querySQL = `SELECT email, password FROM user WHERE email = ? AND password = ?`;
    db.query(querySQL, vals, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
            return;
        }
        if(rows.length >= 1) {
            console.log('User exists and password is correct');
            const session = req.session;
            session.isLoggedIn = true;
            session.role = rows[0].role;
            res.render('view');
        } else {
            console.log('Failed login');
            res.render('login', {error: 'Incorrect login details'});
        }
    });
};

exports.postRegisterRoute =(req, res) =>{
    const {email, password} = req.body;
    console.log(`${email} ${password}`);

    const vals = [email, password];
    const insertSQL = `INSERT INTO user (email, password) VALUES(?,?)`;
    db.query(insertSQL, vals, (err, result) =>{
        if(err){
            console.error('Error inserting user', err);
            res.status(500).send('Error regisering user');
            return;
        }
        console.log('User registered Successfully hai');
        res.render('view');
    });
    
};

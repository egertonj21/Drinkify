const db = require('./../utils/dbconn');

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {data: null});
};
exports.getLoginRoute = (req, res) =>{
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

exports.postAddDrinkRoute = (req, res) => {
    const { ingredient } = req.body;
    console.log(`${ingredient}`);

    let userID, ingredientID;

    const vals = [ingredient];
    const querySQL = `SELECT ingredientID FROM ingredient WHERE ingredientName = ?`;

    db.query(querySQL, vals, (err, result) => {
        if (err) {
            console.error('Error finding ingredient', err);
            res.status(500).send('Error finding ingredient');
            return;
        }
        console.log('Ingredient found Successfully hai');
        ingredientID = result[0].ingredientID;

        const userEmail = req.session.email;
        const queryIDSQL = `SELECT userID FROM user WHERE email = ?`;

        db.query(queryIDSQL, userEmail, (err, result) => {
            if (err) {
                console.error('Error finding user', err);
                res.status(500).send('Error finding user');
                return;
            }
            console.log('UserID found Successfully hai');
            userID = result[0].userID;

            const ids = [userID, ingredientID];
            const insertSQL = 'INSERT INTO useringredient (userID, ingredientID) VALUES (?, ?)';
            
            db.query(insertSQL, ids, (err, result) => {
                if (err) {
                    console.error('Error adding Ingredient', err);
                    res.status(500).send('Error adding Ingredient');
                    return;
                }
                console.log('Ingredient added Successfully hai');
                res.redirect('/cabinet');
            });
        });
    });
};


exports.getCabinetRoute = (req, res) => {

    
    if(req.session.isLoggedIn == true) {
        
        const userEmail = req.session.email;
        const selectSQL = `SELECT ingredientName FROM user 
                           INNER JOIN useringredient ON user.userID = useringredient.userID 
                           INNER JOIN ingredient ON useringredient.ingredientID = ingredient.ingredientID WHERE email=?`;

        db.query(selectSQL, [userEmail], (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
                return;
            }
            
            if (rows.length === 0) {
                // If no ingredients are found in the database
                res.render('view', { error: 'No ingredients found in the cabinet' });
            } else {
                // Render the cabinet view with the ingredients data
                res.render('cabinet', { data: rows, role: req.session.role });
            }
        });
    } else {
        // User is not logged in
        res.render('cabinet', { error: 'You must first log in' });
    }
};



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
            session.email = rows[0].email;
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

exports.postLogoutRoute = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error logging out');
        } else {
            console.log('Logged out successfully');
            res.redirect('/login'); // Redirect to the login page after successful logout
        }
    });
};

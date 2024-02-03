const db = require('./../utils/dbconn');

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {error:null});
};



exports.getAddDrinkRoute =(req, res) =>{
    if(req.session.isLoggedIn == true) {
        const querySQL = `SELECT * FROM ingredient`;

        db.query(querySQL, (error, rows) => {
            if (error) {
                console.log(`error`);
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

exports.getCocktailSearchRoute =(req, res) =>{
    if(req.session.isLoggedIn == true) {
        const querySQL = `SELECT * FROM ingredient`;

        db.query(querySQL, (error, rows) => {
            if (error) {
                console.log(`error`);
                res.status(500).send("Internal Server Error");
                return;
            }
            console.log(rows);
            res.render('cocktailSearch', { data: rows, role: req.session.role });
        });
    } else {
        res.render('login', {error: 'You must first log in'});
    }
};

const axios = require('axios');

exports.postCocktailsRoute = (req, res) => {
    const { ingredient } = req.body;

    if (!ingredient) {
        console.log('No ingredient selected');
        res.redirect('cocktailSearch');
        return;
    }

    console.log(`Ingredient selected: ${ingredient}`);

    // Construct the URL
    const apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;

    // Fetch the JSON data using axios
    axios.get(apiUrl)
        .then(response => {
            // Render the JSON data
            res.render('cocktails', { data: response.data.drinks });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            res.status(500).send('Error fetching data');
        });
};



exports.postAddDrinkRoute = (req, res) => {
    const { ingredient } = req.body;

    // Check if ingredient field is empty
    if (!ingredient) {
        console.log('No ingredient selected');
        // res.status(400).send('No ingredient selected');
        res.redirect('addDrink');
        return;
    }

    console.log(`${ingredient}`);

    let userID, ingredientID;

    const vals = [ingredient];
    const querySQL = `SELECT ingredientID FROM ingredient WHERE ingredientName = ?`;

    db.query(querySQL, vals, (error, result) => {
        if (error) {
            console.error('Error finding ingredient', error);
            res.status(500).send('Error finding ingredient');
            return;
        }

        // Check if ingredient exists in the database
        if (result.length === 0) {
            console.log('Ingredient not found');
            res.status(404).send('Ingredient not found');
            return;
        }

        console.log('Ingredient found Successfully');
        ingredientID = result[0].ingredientID;

        const userEmail = req.session.email;
        const queryIDSQL = `SELECT userID FROM user WHERE email = ?`;

        db.query(queryIDSQL, userEmail, (error, result) => {
            if (error) {
                console.error('Error finding user', error);
                res.status(500).send('Error finding user');
                return;
            }

            console.log('UserID found Successfully');
            userID = result[0].userID;

            const ids = [userID, ingredientID];
            const insertSQL = 'INSERT INTO useringredient (userID, ingredientID) VALUES (?, ?)';
            
            db.query(insertSQL, ids, (error, result) => {
                if (error) {
                    console.error('Error adding Ingredient', error);
                    res.status(500).send('Error adding Ingredient');
                    return;
                }
                console.log('Ingredient added Successfully');
                res.redirect('/cabinet');
            });
        });
    });
};



exports.getCabinetRoute = (req, res) => {
    // Check if user is logged in
    if (!req.session.isLoggedIn) {
        // User is not logged in
        return res.render('cabinet', { data: [], error: 'You must first log in' });
    }

    // User is logged in, proceed to fetch cabinet data
    const userEmail = req.session.email;
    const selectSQL = `SELECT ingredientName FROM user 
                       INNER JOIN useringredient ON user.userID = useringredient.userID 
                       INNER JOIN ingredient ON useringredient.ingredientID = ingredient.ingredientID WHERE email=?`;

    db.query(selectSQL, [userEmail], (error, rows) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Internal Server Error");
        }

        if (rows.length === 0) {
            // If no ingredients are found in the database
            return res.render('view', { error: 'No ingredients found in the cabinet' });
        }

        // Render the cabinet view with the ingredients data
        res.render('cabinet', { data: rows, role: req.session.role, error: null });
    });
};



exports.getRegisterRoute =(req, res) => {
    res.render('register');
};

exports.getLoginRoute = (req, res) => { // Corrected route definition
    res.render('login', {error: null});
};

exports.postLoginRoute = (req, res) => { // Corrected route definition
    const {email, password} = req.body;
    console.log(`${email} ${password}`);

    const vals = [email, password];
    const querySQL = `SELECT email, password FROM user WHERE email = ? AND password = ?`;
    db.query(querySQL, vals, (error, rows) => {
        if (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
            return;
        }
        if(rows.length >= 1) {
            console.log('User exists and password is correct');
            const session = req.session;
            session.isLoggedIn = true;
            session.email = rows[0].email;
            res.render('view', {error: null});
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
    db.query(insertSQL, vals, (error, result) =>{
        if(error){
            console.error('Error inserting user', error);
            res.status(500).send('Error regisering user');
            return;
        }
        console.log('User registered Successfully hai');
        res.render('view');
    });
    
};


exports.postLogoutRoute = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error destroying session:', error);
            res.status(500).send('Error logging out');
        } else {
            console.log('Logged out successfully');
            res.redirect('/login'); // Redirect to the login page after successful logout
        }
    });
};

exports.postDeleteDrink = (req, res) => {
    const { ingredientName } = req.body;
    console.log(`${ingredientName}`);

    const selectIngredientQuery = 'SELECT ingredientID FROM ingredient WHERE ingredientName = ?';
    db.query(selectIngredientQuery, [ingredientName], (error, results) => {
        if (error) {
            console.error('Error finding ingredient', error);
            return res.status(500).send('Error finding ingredient');
        }

        if (results.length === 0) {
            
            return res.status(404).send('Ingredient not found');
        }

        const ingredientID = results[0].ingredientID;

        const selectUserIDQuery = 'SELECT userID FROM user WHERE email = ?';
        const userEmail = req.session.email;

        db.query(selectUserIDQuery, [userEmail], (error, results) => {
            if (error) {
                console.error('Error finding user', error);
                return res.status(500).send('Error finding user');
            }

            if (results.length === 0) {
                return res.status(404).send('User not found');
            }

            const userID = results[0].userID;

            const deleteQuery = 'DELETE FROM useringredient WHERE ingredientID = ? AND userID = ?';
            const deleteParams = [ingredientID, userID];

            db.query(deleteQuery, deleteParams, (error, results) => {
                if (error) {
                    console.error('Error deleting ingredient', error);
                    return res.status(500).send('Error deleting ingredient');
                }

                console.log('Ingredient Deleted Successfully');
                res.redirect('/cabinet');
            });
        });
    });
};


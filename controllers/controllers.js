const db = require('./../utils/dbconn');
const sqlQueries = require('./../queries/sqlQueries');

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {error:null});
};

exports.getAddDrinkRoute = (req, res) => {
    if (req.session.isLoggedIn == true) {
        sqlQueries.getAllIngredients()
            .then(rows => {
                res.render('addDrink', { data: rows });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('Internal Server Error');
            });
    } else {
        // Handle case when user is not logged in
        res.render('login', { error: 'You must first log in' });
    }
};




// exports.getAddDrinkRoute =(req, res) =>{
//     if(req.session.isLoggedIn == true) {
//         const querySQL = `SELECT * FROM ingredient`;

//         db.query(querySQL, (error, rows) => {
//             if (error) {
//                 console.log(`error`);
//                 res.status(500).send("Internal Server Error");
//                 return;
//             }
//             console.log(rows);
//             res.render('addDrink', { data: rows, role: req.session.role });
//         });
//     } else {
//         res.render('login', {error: 'You must first log in'});
//     }
// };
exports.getCocktailSearchRoute =(req, res) =>{
    if(req.session.isLoggedIn == true) {
        sqlQueries.getAllIngredients()
        .then(rows => {
            res.render('cocktailSearch', {data: rows});
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Internal Error');
        });
    }else{
        res.render('login', {error: 'You must first log in'});
    }
};


// exports.getCocktailSearchRoute =(req, res) =>{
//     if(req.session.isLoggedIn == true) {
//         const querySQL = `SELECT * FROM ingredient`;

//         db.query(querySQL, (error, rows) => {
//             if (error) {
//                 console.log(`error`);
//                 res.status(500).send("Internal Server Error");
//                 return;
//             }
//             // console.log(rows);
//             res.render('cocktailSearch', { data: rows, role: req.session.role });
//         });
//     } else {
//         res.render('login', {error: 'You must first log in'});
//     }
// };

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

exports.postRandomCocktailRoute = (req, res) => {
    const { ingredient } = req.body;

    // Check if the ingredient is provided
    if (!ingredient) {
        res.status(400).send('Ingredient not provided');
        return;
    }

    // Construct the URL to fetch a random cocktail with the specified ingredient
    const apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`;

    // Fetch the list of cocktails with the specified ingredient
    axios.get(apiUrl)
        .then(response => {
            const cocktails = response.data.drinks;
            
            // Check if any cocktails are found
            if (!cocktails || cocktails.length === 0) {
                res.status(404).send(`No cocktails found with ${ingredient}`);
                return;
            }

            // Choose a random cocktail from the list
            const randomIndex = Math.floor(Math.random() * cocktails.length);
            const randomCocktail = cocktails[randomIndex];

            // Render the cocktail details
            res.render('randomCocktail', { randomCocktail: randomCocktail });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            res.status(500).send('Error fetching data');
        });
};

exports.postCocktailDetailsRoute = (req, res) => {
    const { idDrink } = req.body;
    const apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idDrink}`;
    axios.get(apiUrl)
        .then(response => {
            if (response.data && response.data.drinks && response.data.drinks.length > 0) {
                res.render('cocktailDetail', { data: response.data.drinks });
            } else {
                res.status(404).send('Cocktail not found');
            }
        })
        .catch(error => {
            console.error('Error fetching data', error);
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

    // Get the ingredientID by name
    sqlQueries.getingredientIDbyName(ingredient)
        .then(rows => {
            // Check if ingredient exists
            if (rows.length === 0) {
                console.log('Ingredient not found');
                res.status(404).send('Ingredient not found');
                return;
            }

            console.log('Ingredient found Successfully');
            ingredientID = rows[0].ingredientID;

            const userEmail = req.session.email;

            // Get the userID by email
            return sqlQueries.getUserIDbyEmail(userEmail);
        })
        .then(rows => {
            if (rows.length === 0) {
                console.log('User not found');
                res.status(404).send('User not found');
                return;
            }

            console.log('UserID found Successfully');
            userID = rows[0].userID;

            // Insert user ingredient directly
            return sqlQueries.insertUserIngredient(userID, ingredientID);
        })
        .then(() => {
            console.log('Ingredient added Successfully');
            res.redirect('/cabinet');
        })
        .catch(error => {
            console.error('Error adding Ingredient', error);
            res.status(500).send('Error adding Ingredient');
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

    // Fetch cabinet data using SQL queries
    sqlQueries.getIngredientByUserEmail(userEmail)
        .then(rows => {
            if (rows.length === 0) {
                // If no ingredients are found in the database
                return res.render('view', { error: 'No ingredients found in the cabinet' });
            }

            // Render the cabinet view with the ingredients data
            res.render('cabinet', { data: rows, role: req.session.role, error: null });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send("Internal Server Error");
        });
};




exports.getRegisterRoute =(req, res) => {
    res.render('register');
};

exports.getLoginRoute = (req, res) => {
    res.render('login', {error: null});
};

// exports.postLoginRoute = (req, res) => {
//     const {email, password} = req.body;
//     console.log(`${email} ${password}`);

//     const vals = [email, password];
//     const querySQL = `SELECT email, password FROM user WHERE email = ? AND password = ?`;
//     db.query(querySQL, vals, (error, rows) => {
//         if (error) {
//             console.log(error);
//             res.status(500).send("Internal Server Error");
//             return;
//         }
//         if(rows.length >= 1) {
//             console.log('User exists and password is correct');
//             const session = req.session;
//             session.isLoggedIn = true;
//             session.email = rows[0].email;
//             res.render('view', {error: null});
//         } else {
//             console.log('Failed login');
//             res.render('login', {error: 'Incorrect login details'});
//         }
//     });
// };
exports.postLoginRoute = (req, res) => {
    const { email, password } = req.body;
    console.log(`${email}, ${password}`)
    sqlQueries.getUserIDbyEmail(email)
        .then(rows => {
            if (rows.length >= 1 && rows[0].password === password) {
                // User exists and password is correct
                req.session.isLoggedIn = true;
                req.session.email = email;
                res.render('view', { error: null });
            } else {
                // Failed login
                res.render('login', { error: 'Incorrect login details' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Internal Server Error");
        });
};


exports.postRegisterRoute =(req, res) =>{
    const {email, password} = req.body;
    console.log(`${email} ${password}`);

    // const vals = [email, password];
    // const insertSQL = `INSERT INTO user (email, password) VALUES(?,?)`;
    // db.query(insertSQL, vals, (error, result) =>{
    //     if(error){
    //         console.error('Error inserting user', error);
    //         res.status(500).send('Error regisering user');
    //         return;
    //     }
    //     console.log('User registered Successfully hai');
    //     res.render('view');
    // });
    sqlQueries.insertUser(email, password)
        .then(result => {
            console.log('User registered successfully');
            res.render('view', {error:null});
        })
        .catch(error => {
            console.error('Error inserting user', error);
            res.status(500).send('Error registering user');
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

    // Find the ingredient ID by its name
    sqlQueries.getingredientIDbyName(ingredientName)
        .then(rows => {
            if (rows.length === 0) {
                return res.status(404).send('Ingredient not found');
            }

            const ingredientID = rows[0].ingredientID;

            // Find the user ID by email from the session
            const userEmail = req.session.email;
            return sqlQueries.getUserIDbyEmail(userEmail)
                .then(rows => {
                    if (rows.length === 0) {
                        return res.status(404).send('User not found');
                    }

                    const userID = rows[0].userID;

                    // Delete the ingredient from user's cabinet
                    return sqlQueries.deleteIngredient(ingredientID, userID)
                        .then(() => {
                            console.log('Ingredient Deleted Successfully');
                            res.redirect('/cabinet');
                        })
                        .catch(error => {
                            console.error('Error deleting ingredient', error);
                            res.status(500).send('Error deleting ingredient');
                        });
                });
        })
        .catch(error => {
            console.error('Error finding ingredient or user', error);
            res.status(500).send('Internal Server Error');
        });
};



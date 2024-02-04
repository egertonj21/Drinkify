const db = require('./../utils/dbconn');

module.exports = {

    getAllIngredients: async () => {
        const query = ' SELECT * FROM ingredient';
        return await db.query(query);
    },

    getingredientIDbyName: async (ingredient) => {
        const query = 'SELECT ingredientID FROM ingredient WHERE ingredientName = ?';
        return await db.query(query, [ingredient]);
    },
    
    getUserIDbyEmail: async (email) => {
        const query = 'SELECT * FROM user WHERE email = ?';
        return await db.query(query, [email]);
    },

    insertUserIngredient: async (userID, ingredientID) => {
        const query = 'INSERT INTO useringredient (userID, ingredientID) VALUES (?, ?)';
        return await db.query(query, [userID, ingredientID]);
    },

    getIngredientByUserEmail: async (userEmail) => {
        const query = `SELECT ingredientName FROM user 
        INNER JOIN useringredient ON user.userID = useringredient.userID 
        INNER JOIN ingredient ON useringredient.ingredientID = ingredient.ingredientID WHERE email=?`;
        return await db.query(query, [userEmail]);
    },

    getLoginInfo: async (email, password) => {
        const query = `SELECT email, password FROM user WHERE email = ? AND password = ?`;
        return await db.query(query, [email, password]);
    },

    insertUser: async (email, password) => {
        const query = `INSERT INTO user (email, password) VALUES(?,?)`;
        return await db.query(query, [email, password]);
    },

    deleteIngredient: async (ingredientID, userID) => {
        const query = 'DELETE FROM useringredient WHERE ingredientID = ? AND userID = ?';
        return await db.query(query, [ingredientID, userID]);
    }
}
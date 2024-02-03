const express = require('express');
const controller = require('./../controllers/controllers');
const router = express.Router();


router.get('/', controller.getDefaultRoute);
router.get('/login', controller.getLoginRoute);
router.post('/login', controller.postLoginRoute);
router.get('/register', controller.getRegisterRoute);
router.post('/register', controller.postRegisterRoute);
router.get('/cabinet', controller.getCabinetRoute);
router.get('/addDrink', controller.getAddDrinkRoute);
router.post('/addDrink', controller.postAddDrinkRoute);
router.post('/logout', controller.postLogoutRoute);
router.post('/deleteIngredient', controller.postDeleteDrink);
router.get('/cocktailSearch', controller.getCocktailSearchRoute);
router.post('/cocktails', controller.postCocktailsRoute);
router.post('/cocktailDetails', controller.postCocktailDetailsRoute);
router.post('/randomCocktail', controller.postRandomCocktailRoute);
module.exports = router;
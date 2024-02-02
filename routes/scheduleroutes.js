const express = require('express');
const controller = require('./../controllers/controllers');
const router = express.Router();


router.get('/', controller.getDefaultRoute);
router.post('/login', controller.postLoginRoute);
router.get('/register', controller.getRegisterRoute);
router.post('/register', controller.postRegisterRoute);
module.exports = router;
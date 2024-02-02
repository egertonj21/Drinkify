const express = require('express');
const controller = require('./../controllers/controllers');
const router = express.Router();


router.get('/', controller.getDefaultRoute);
router.post('/login', controller.postLoginRoute);

module.exports = router;
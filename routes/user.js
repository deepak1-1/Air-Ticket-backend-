const express  = require('express');
const router = express.Router()
const userController = require('../controllers/userController');


router.get('/check-user', userController.checkUser);

module.exports = router;
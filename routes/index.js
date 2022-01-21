const express = require('express');
const router = express.Router();
const indexControllers = require('../controllers/indexController')

router.post('/register', indexControllers.register_user);

router.post('/check-user', indexControllers.check_user);

router.post('/login', indexControllers.login);

router.post('/send-code', indexControllers.send_code)

router.post('/update-password', indexControllers.update_password);

router.post('/login-admin', indexControllers.login_admin);

router.post('/update-password-admin', indexControllers.update_admin_password);

router.post('/google/register', indexControllers.handle_google_register);

router.post('/google/login', indexControllers.handle_google_login);

module.exports = router;
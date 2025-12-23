const express = require('express');
const {
	renderRegister,
	handleRegister,
	renderVerify,
	handleVerify,
	renderLogin,
	handleLogin,
	handleLogout
} = require('../controller/authController');

const router = express.Router();

router.get('/register', renderRegister);
router.post('/register', handleRegister);

router.get('/verify', renderVerify);
router.post('/verify', handleVerify);

router.get('/login', renderLogin);
router.post('/login', handleLogin);

router.post('/logout', handleLogout);

module.exports = router;




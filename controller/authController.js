const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('./mailer');
const { createUser, findUserByEmail, markUserVerified } = require('../model/userModel');
const { createOtp, findValidOtp, markOtpUsed } = require('../model/otpModel');

function renderRegister(req, res) {
	res.render('register');
}

async function handleRegister(req, res) {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).render('register', { error: 'All fields are required.' });
		}
		const existing = await findUserByEmail(email);
		if (existing) {
			return res.status(400).render('register', { error: 'Email already registered.' });
		}
		const passwordHash = await bcrypt.hash(password, 10);
		await createUser({ name, email, passwordHash });

		// Create OTP
		const code = String(Math.floor(100000 + Math.random() * 900000));
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
		await createOtp({ email, code, expiresAt });
		await sendOtpEmail(email, code);

		req.session.pendingEmail = email;
		return res.redirect('/verify');
	} catch (err) {
		console.error(err);
		return res.status(500).render('register', { error: 'Server error.' });
	}
}

function renderVerify(req, res) {
	if (!req.session.pendingEmail) {
		return res.redirect('/register');
	}
	res.render('verify-otp', { email: req.session.pendingEmail });
}

async function handleVerify(req, res) {
	const { code } = req.body;
	const email = req.session.pendingEmail;
	if (!email) return res.redirect('/register');
	if (!code) return res.status(400).render('verify-otp', { email, error: 'Enter the OTP.' });

	const otp = await findValidOtp(email, code);
	if (!otp) {
		return res.status(400).render('verify-otp', { email, error: 'Invalid or expired OTP.' });
	}
	await markOtpUsed(otp.id);
	await markUserVerified(email);
	delete req.session.pendingEmail;
	res.redirect('/login');
}

function renderLogin(req, res) {
	res.render('login');
}

async function handleLogin(req, res) {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).render('login', { error: 'Email and password required.' });
	}
	const user = await findUserByEmail(email);
	if (!user) {
		return res.status(400).render('login', { error: 'Invalid credentials.' });
	}
	if (!user.is_verified) {
		return res.status(403).render('login', { error: 'Please verify your email via OTP first.' });
	}
	const ok = await bcrypt.compare(password, user.password_hash);
	if (!ok) {
		return res.status(400).render('login', { error: 'Invalid credentials.' });
	}
	req.session.user = { id: user.id, name: user.name, email: user.email };
	res.redirect('/dashboard');
}

function handleLogout(req, res) {
	req.session.destroy(() => {
		res.redirect('/login');
	});
}

module.exports = {
	renderRegister,
	handleRegister,
	renderVerify,
	handleVerify,
	renderLogin,
	handleLogin,
	handleLogout
};



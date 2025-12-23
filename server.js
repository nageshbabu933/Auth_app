require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Express config
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
	})
);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Locals for flash-like messages
app.use((req, res, next) => {
	res.locals.error = null;
	res.locals.success = null;
	next();
});

// Routes
app.use('/', authRoutes);

// Protected dashboard route
app.get('/dashboard', (req, res) => {
	if (!req.session.user) {
		return res.redirect('/login');
	}
	res.render('dashboard', { user: req.session.user });
});

app.get('/', (req, res) => {
	res.redirect('/register');
});

const PORT = process.env.PORT || 6060;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});



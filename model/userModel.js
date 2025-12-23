const { getPool, sql } = require('./db');

async function createUser({ name, email, passwordHash }) {
	const pool = await getPool();
	const result = await pool
		.request()
		.input('name', sql.NVarChar, name)
		.input('email', sql.NVarChar, email)
		.input('passwordHash', sql.NVarChar, passwordHash)
		.query(
			'INSERT INTO users (name, email, password_hash) OUTPUT INSERTED.id VALUES (@name, @email, @passwordHash)'
		);
	return result.recordset[0].id;
}

async function findUserByEmail(email) {
	const pool = await getPool();
	const result = await pool
		.request()
		.input('email', sql.NVarChar, email)
		.query('SELECT TOP 1 * FROM users WHERE email = @email');
	return result.recordset[0];
}

async function markUserVerified(email) {
	const pool = await getPool();
	await pool
		.request()
		.input('email', sql.NVarChar, email)
		.query('UPDATE users SET is_verified = 1 WHERE email = @email');
}

module.exports = { createUser, findUserByEmail, markUserVerified };



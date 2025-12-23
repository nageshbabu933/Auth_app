const { getPool, sql } = require('./db');

async function createOtp({ email, code, expiresAt }) {
	const pool = await getPool();
	await pool
		.request()
		.input('email', sql.NVarChar, email)
		.input('code', sql.NVarChar, code)
		.input('expiresAt', sql.DateTime2, new Date(expiresAt))
		.query('INSERT INTO otps (email, code, expires_at) VALUES (@email, @code, @expiresAt)');
}

async function findValidOtp(email, code) {
	const pool = await getPool();
	const result = await pool
		.request()
		.input('email', sql.NVarChar, email)
		.input('code', sql.NVarChar, code)
		.query(
			"SELECT TOP 1 * FROM otps WHERE email = @email AND code = @code AND used = 0 AND expires_at > SYSUTCDATETIME() ORDER BY id DESC"
		);
	return result.recordset[0];
}

async function markOtpUsed(id) {
	const pool = await getPool();
	await pool.request().input('id', sql.Int, id).query('UPDATE otps SET used = 1 WHERE id = @id');
}

module.exports = { createOtp, findValidOtp, markOtpUsed };



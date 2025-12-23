const sql = require('mssql');

// Support host\\instance syntax via env MSSQL_SERVER
const rawServer = process.env.MSSQL_SERVER || '192.168.0.13\NAG1_SERVER';
const hasInstance = rawServer.includes('\\');
const host = hasInstance ? rawServer.split('\\')[0] : rawServer;
const instanceName = hasInstance ? rawServer.split('\\')[1] : (process.env.MSSQL_INSTANCE || undefined);
const resolvedPort = hasInstance ? undefined : Number(process.env.MSSQL_PORT || 1433);

const config = {
	server: host,
	database: process.env.MSSQL_DATABASE || 'otp_app',
	user: process.env.MSSQL_USER || 'sa',
	password: process.env.MSSQL_PASSWORD || 'Nagesh@12',
	port: resolvedPort,
	options: {
		encrypt: String(process.env.MSSQL_ENCRYPT || 'true') === 'true',
		trustServerCertificate: String(process.env.MSSQL_TRUST_SERVER_CERT || 'true') === 'true',
		instanceName
	}
};

let poolPromise;

function getPool() {
	if (!poolPromise) {
		poolPromise = sql
			.connect(config)
			.then(async (pool) => {
				await ensureSchema(pool);
				return pool;
			})
			.catch((err) => {
				console.error('MSSQL Connection Error:', err);
				throw err;
			});
	}
	return poolPromise;
}

async function ensureSchema(pool) {
	await pool.request().batch(`
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
  CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    is_verified BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='otps' AND xtype='U')
BEGIN
  CREATE TABLE otps (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    code NVARCHAR(16) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
  CREATE INDEX IX_otps_email ON otps(email);
END;
`);
}

module.exports = { sql, getPool };



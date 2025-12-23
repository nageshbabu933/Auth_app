const nodemailer = require('nodemailer');

let cachedTransport = null;

async function getTransport() {
	if (cachedTransport) return cachedTransport;

	if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
		cachedTransport = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT || 587),
			secure: String(process.env.SMTP_SECURE || 'false') === 'true',
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		});
		return cachedTransport;
	}

	// Ethereal fallback for development/testing
	const testAccount = await nodemailer.createTestAccount();
	cachedTransport = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass
		}
	});
	console.log('Using Ethereal test SMTP. Login:', testAccount.user);
	console.log('Password:', testAccount.pass);
	return cachedTransport;
}

async function sendOtpEmail(toEmail, otpCode) {
	const transport = await getTransport();
	const info = await transport.sendMail({
		from: process.env.MAIL_FROM || 'no-reply@example.com',
		to: toEmail,
		subject: 'Your OTP Code',
		html: `<p>Your OTP code is <b>${otpCode}</b>. It expires in 10 minutes.</p>`
	});
	const preview = nodemailer.getTestMessageUrl(info);
	if (preview) {
		console.log('Preview your OTP email at:', preview);
	}
}

module.exports = { sendOtpEmail };



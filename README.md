# OTP Auth App (Node.js + EJS + SQLite)

End-to-end registration with email OTP verification and login for verified users.

## Stack
- Node.js, Express, express-session
- EJS views
- SQLite (better-sqlite3)
- Nodemailer (Ethereal fallback)

## Setup
1. Install dependencies
```bash
npm install
```

2. Create `.env`
```
PORT=3000
SESSION_SECRET=replace_me
# MS SQL Server
MSSQL_SERVER=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=otp_app
MSSQL_USER=sa
MSSQL_PASSWORD=yourStrong(!)Password
# Use real SMTP to send real emails (otherwise Ethereal test will be used)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your_user
# SMTP_PASS=your_pass
# MAIL_FROM="No Reply <no-reply@example.com>"
```

3. Run the app
```bash
npm run dev
# or
npm start
```

Open http://localhost:3000

## Flow
- Register: name, email, password
- OTP is generated and emailed (check console for Ethereal preview URL)
- Verify OTP
- Login with email + password (only if verified)

## Notes
- Uses MS SQL Server with tables auto-created on first run.
- To reset, drop tables `users` and `otps`.

## Email setup (you configure)
Two options:

1) Ethereal test SMTP (default if no SMTP_* set)
- Start the app; console logs an Ethereal inbox preview URL for each OTP email.
- Click the URL to view the message and copy the OTP.

2) Real SMTP
- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and optionally `MAIL_FROM` in `.env`.
- Ensure the SMTP user has permission to send. For common providers:
  - Gmail: enable App Passwords, use app pass as `SMTP_PASS`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`.
  - Outlook/Office365: `SMTP_HOST=smtp.office365.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`.
  - Custom SMTP: check your provider docs; TLS usually port 587.
- Restart the server after changes.

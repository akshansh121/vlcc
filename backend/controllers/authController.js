const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/database');
const { sendOtpEmail } = require('../utils/email');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const TEMP_ADMIN_EMAIL = 'abc@gmail.com';
const TEMP_ADMIN_PASSWORD = '123456789';
const TEMP_ADMIN_HASH = '$2b$12$LcWCqqiQW0IPfr12TM/8kuVU4hmaO7hr9N3Da17z6nznjvQMGOxni';

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, mobile, password } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, mobile, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, mobile, role, created_at`,
      [name, email, mobile, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, name, email, mobile, password, role, is_blocked FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: 'user' });

    const { password: _pw, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userData, token },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/admin/login
const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    if (email === TEMP_ADMIN_EMAIL && password === TEMP_ADMIN_PASSWORD) {
      const tempAdmin = await db.query(
        `INSERT INTO admins (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email)
         DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, updated_at = NOW()
         RETURNING id, name, email, role`,
        ['Beauty World Admin', TEMP_ADMIN_EMAIL, TEMP_ADMIN_HASH, 'super_admin']
      );

      const admin = tempAdmin.rows[0];
      const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: { admin, token },
      });
    }

    const result = await db.query(
      'SELECT id, name, email, password, role FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });

    const { password: _pw, ...adminData } = admin;

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: { admin: adminData, token },
    });
  } catch (err) {
    console.error('adminLogin error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/auth/me  (user or admin — req.userType set by authenticateAny)
const getMe = async (req, res) => {
  try {
    if (req.userType === 'admin') {
      const result = await db.query(
        'SELECT id, name, email, role, created_at FROM admins WHERE id = $1',
        [req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    const result = await db.query(
      'SELECT id, name, email, mobile, role, is_blocked, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/auth/me
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, mobile } = req.body;
    const userId = req.user.id;

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (mobile !== undefined) {
      fields.push(`mobile = $${idx++}`);
      values.push(mobile);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, mobile, role, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [
      hashedPassword,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email' });
    }

    // Find or create user
    let userResult = await db.query(
      'SELECT id, name, email, mobile, role, is_blocked FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
      if (user.is_blocked) {
        return res.status(403).json({ success: false, message: 'Account has been blocked. Please contact support.' });
      }
    } else {
      // Create new Google-auth user — random password (they'll always sign in via Google)
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const insertResult = await db.query(
        `INSERT INTO users (name, email, mobile, password, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, name, email, mobile, role`,
        [name || email.split('@')[0], email, '0000000000', randomPassword]
      );
      user = insertResult.rows[0];
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      success: true,
      message: 'Google login successful',
      data: { user, token },
    });
  } catch (err) {
    console.error('googleAuth error:', err);
    return res.status(401).json({ success: false, message: 'Google sign-in failed. Please try again.' });
  }
};

// Ensure OTP table exists (called once on first use)
const ensureOtpTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(150) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await ensureOtpTable();

    const userResult = await db.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this email. Please check and try again.' });
    }

    const user = userResult.rows[0];

    // Invalidate any previous unused OTPs for this email
    await db.query(
      'UPDATE password_reset_otps SET used = TRUE WHERE email = $1 AND used = FALSE',
      [user.email]
    );

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.query(
      'INSERT INTO password_reset_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [user.email, otp, expiresAt]
    );

    // Send email (fire-and-forget so response is immediate)
    setImmediate(async () => {
      try {
        await sendOtpEmail(user, otp);
      } catch (err) {
        console.error('OTP email error:', err.message);
      }
    });

    return res.json({ success: true, message: 'OTP sent to your email address.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const result = await db.query(
      `SELECT id FROM password_reset_otps
       WHERE email = $1 AND otp = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase().trim(), otp.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
    }

    // Mark OTP as used
    await db.query('UPDATE password_reset_otps SET used = TRUE WHERE id = $1', [result.rows[0].id]);

    // Issue a short-lived reset token (15 min)
    const resetToken = jwt.sign(
      { email: email.toLowerCase().trim(), purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ success: true, message: 'OTP verified.', data: { resetToken } });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new OTP.' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateResult = await db.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2 RETURNING id',
      [hashedPassword, decoded.email]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  register, login, adminLogin, getMe, updateProfile, changePassword, googleAuth,
  forgotPassword, verifyOtp, resetPassword,
};

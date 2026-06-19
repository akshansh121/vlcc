const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Authenticate regular users.
 * Looks up users table; blocks if account is blocked.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Access denied. No valid token provided.' });
    }

    const result = await query(
      'SELECT id, name, email, mobile, role, is_blocked FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Access denied. User not found.' });
    }

    const user = result.rows[0];
    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
    }
    next(error);
  }
};

/**
 * Authenticate admins.
 * For admin/super_admin roles: looks up admins table.
 * For user role with admin query (shouldn't happen): rejects.
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Access denied. No valid token provided.' });
    }

    // Admin tokens have role = 'admin' or 'super_admin'
    if (!decoded.role || !['admin', 'super_admin'].includes(decoded.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const result = await query(
      'SELECT id, name, email, role FROM admins WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Access denied. Admin not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
    }
    next(error);
  }
};

/**
 * Attach user to req if a valid token is present, but do not block
 * the request if token is absent or invalid.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      req.user = null;
      return next();
    }

    if (!decoded) {
      req.user = null;
      return next();
    }

    const result = await query(
      'SELECT id, name, email, mobile, role, is_blocked FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || result.rows[0].is_blocked) {
      req.user = null;
      return next();
    }

    req.user = result.rows[0];
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Authenticate any token — user or admin.
 * Sets req.user with the resolved account and req.userType ('user' | 'admin').
 */
const authenticateAny = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Access denied. No valid token provided.' });
    }

    if (decoded.role && ['admin', 'super_admin'].includes(decoded.role)) {
      const result = await query('SELECT id, name, email, role FROM admins WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Admin not found.' });
      }
      req.user = result.rows[0];
      req.userType = 'admin';
    } else {
      const result = await query(
        'SELECT id, name, email, mobile, role, is_blocked FROM users WHERE id = $1',
        [decoded.id]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }
      if (result.rows[0].is_blocked) {
        return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
      }
      req.user = result.rows[0];
      req.userType = 'user';
    }
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token has expired.' });
    next(error);
  }
};

module.exports = { authenticateUser, authenticateAdmin, optionalAuth, authenticateAny };

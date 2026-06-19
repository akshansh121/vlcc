const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateUser, authenticateAny } = require('../middleware/auth');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('mobile')
      .trim()
      .notEmpty()
      .withMessage('Mobile number is required')
      .isMobilePhone()
      .withMessage('Valid mobile number is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// POST /api/auth/admin/login
router.post(
  '/admin/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.adminLogin
);

// GET /api/auth/me  (works for both users and admins)
router.get('/me', authenticateAny, authController.getMe);

// PUT /api/auth/me
router.put(
  '/me',
  authenticateUser,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('mobile').optional().isMobilePhone().withMessage('Valid mobile number is required'),
  ],
  authController.updateProfile
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authenticateUser,
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  authController.changePassword
);

// POST /api/auth/google
router.post('/google', authController.googleAuth);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  authController.forgotPassword
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  authController.verifyOtp
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.resetPassword
);

module.exports = router;

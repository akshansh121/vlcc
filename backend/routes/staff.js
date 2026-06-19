const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const staffController = require('../controllers/staffController');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/staff
router.get('/', staffController.getStaff);

// GET /api/staff/:id
router.get('/:id', staffController.getStaffMember);

// POST /api/staff
router.post(
  '/',
  authenticateAdmin,
  [
    body('name').trim().notEmpty().withMessage('Staff name is required'),
    body('designation').optional().trim(),
    body('mobile').optional().isMobilePhone().withMessage('Valid mobile number is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience years must be a non-negative integer'),
  ],
  staffController.createStaff
);

// PUT /api/staff/:id
router.put(
  '/:id',
  authenticateAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('Staff name cannot be empty'),
    body('mobile').optional().isMobilePhone().withMessage('Valid mobile number is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('experience_years').optional().isInt({ min: 0 }).withMessage('Experience years must be a non-negative integer'),
  ],
  staffController.updateStaff
);

// DELETE /api/staff/:id (toggle active)
router.delete('/:id', authenticateAdmin, staffController.toggleStaff);

module.exports = router;

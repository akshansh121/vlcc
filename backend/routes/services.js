const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/services?category_id=&search=&page=&limit=
router.get('/', serviceController.getServices);

// GET /api/services/:id
router.get('/:id', serviceController.getService);

// POST /api/services
router.post(
  '/',
  authenticateAdmin,
  [
    body('name').trim().notEmpty().withMessage('Service name is required'),
    body('original_price').isFloat({ min: 0 }).withMessage('Original price must be a non-negative number'),
    body('discounted_price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number'),
    body('category_id').optional({ nullable: true }).isInt().withMessage('category_id must be an integer'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  ],
  serviceController.createService
);

// PUT /api/services/:id
router.put(
  '/:id',
  authenticateAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('Service name cannot be empty'),
    body('original_price').optional().isFloat({ min: 0 }).withMessage('Original price must be a non-negative number'),
    body('discounted_price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number'),
    body('category_id').optional({ nullable: true }).isInt().withMessage('category_id must be an integer'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  ],
  serviceController.updateService
);

// DELETE /api/services/:id  (soft delete / toggle active)
router.delete('/:id', authenticateAdmin, serviceController.toggleService);

module.exports = router;

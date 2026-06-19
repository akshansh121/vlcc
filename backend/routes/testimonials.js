const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const testimonialController = require('../controllers/testimonialController');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/testimonials
router.get('/', testimonialController.getTestimonials);

// POST /api/testimonials
router.post(
  '/',
  authenticateAdmin,
  [
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('review').trim().notEmpty().withMessage('Review text is required'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
  ],
  testimonialController.createTestimonial
);

// PUT /api/testimonials/:id
router.put(
  '/:id',
  authenticateAdmin,
  [
    body('customer_name').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
    body('review').optional().trim().notEmpty().withMessage('Review text cannot be empty'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
  ],
  testimonialController.updateTestimonial
);

// DELETE /api/testimonials/:id
router.delete('/:id', authenticateAdmin, testimonialController.deleteTestimonial);

module.exports = router;

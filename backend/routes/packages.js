const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const packageController = require('../controllers/packageController');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/packages
router.get('/', packageController.getPackages);

// GET /api/packages/:id
router.get('/:id', packageController.getPackage);

// POST /api/packages
router.post(
  '/',
  authenticateAdmin,
  [
    body('name').trim().notEmpty().withMessage('Package name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('service_ids').optional().isArray().withMessage('service_ids must be an array'),
  ],
  packageController.createPackage
);

// PUT /api/packages/:id
router.put(
  '/:id',
  authenticateAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('Package name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  ],
  packageController.updatePackage
);

// DELETE /api/packages/:id
router.delete('/:id', authenticateAdmin, packageController.deletePackage);

// POST /api/packages/:id/services
router.post(
  '/:id/services',
  authenticateAdmin,
  [
    body('service_id').isInt({ min: 1 }).withMessage('service_id must be a positive integer'),
  ],
  packageController.addService
);

// DELETE /api/packages/:id/services/:serviceId
router.delete('/:id/services/:serviceId', authenticateAdmin, packageController.removeService);

module.exports = router;

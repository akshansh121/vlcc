const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

// All admin routes require admin authentication
router.use(authenticateAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// GET /api/admin/revenue
router.get('/revenue', adminController.getRevenue);

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// GET /api/admin/users/:id
router.get('/users/:id', adminController.getUserDetails);

// PUT /api/admin/users/:id/block
router.put('/users/:id/block', adminController.toggleBlockUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;

const { validationResult } = require('express-validator');
const db = require('../config/database');

// GET /api/testimonials
const getTestimonials = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, customer_name, review, rating, customer_image, is_active, created_at, updated_at
       FROM testimonials
       WHERE is_active = true
       ORDER BY created_at DESC`
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getTestimonials error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/testimonials
const createTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { customer_name, review, rating, customer_image, is_active = true } = req.body;

    const result = await db.query(
      `INSERT INTO testimonials (customer_name, review, rating, customer_image, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [customer_name, review, rating || null, customer_image || null, is_active]
    );

    return res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('createTestimonial error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/testimonials/:id
const updateTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { id } = req.params;
    const { customer_name, review, rating, customer_image, is_active } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (customer_name !== undefined) { fields.push(`customer_name = $${idx++}`); values.push(customer_name); }
    if (review !== undefined) { fields.push(`review = $${idx++}`); values.push(review); }
    if (rating !== undefined) { fields.push(`rating = $${idx++}`); values.push(rating); }
    if (customer_image !== undefined) { fields.push(`customer_image = $${idx++}`); values.push(customer_image); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE testimonials SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('updateTestimonial error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/testimonials/:id
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM testimonials WHERE id = $1 RETURNING id, customer_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('deleteTestimonial error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };

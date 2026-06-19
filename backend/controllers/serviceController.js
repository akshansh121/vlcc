const { validationResult } = require('express-validator');
const db = require('../config/database');

const SERVICE_COLS = `s.id, s.name, s.description, s.duration, s.original_price, s.discounted_price,
  s.image_url, s.is_active, s.created_at, s.updated_at,
  c.id AS category_id, c.name AS category_name`;

// GET /api/services
const getServices = async (req, res) => {
  try {
    const { category_id, search, page = 1, limit = 20, include_inactive = 'false' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = include_inactive === 'true' ? [] : ['s.is_active = true'];
    const values = [];
    let idx = 1;

    if (category_id) {
      conditions.push(`s.category_id = $${idx++}`);
      values.push(parseInt(category_id));
    }
    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(`SELECT COUNT(*) FROM services s ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit));
    values.push(offset);

    const result = await db.query(
      `SELECT ${SERVICE_COLS}
       FROM services s
       LEFT JOIN categories c ON s.category_id = c.id
       ${whereClause}
       ORDER BY s.name ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('getServices error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/services/:id
const getService = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ${SERVICE_COLS}
       FROM services s
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getService error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/services
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { name, description, original_price, discounted_price, duration, image_url, category_id, is_active = true } = req.body;
    const result = await db.query(
      `INSERT INTO services (name, description, original_price, discounted_price, duration, image_url, category_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description || null, original_price, discounted_price || null, duration || 60, image_url || null, category_id || null, is_active]
    );
    return res.status(201).json({ success: true, message: 'Service created successfully', data: result.rows[0] });
  } catch (err) {
    console.error('createService error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/services/:id
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { id } = req.params;
    const allowed = ['name', 'description', 'original_price', 'discounted_price', 'duration', 'image_url', 'category_id', 'is_active'];
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await db.query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.status(200).json({ success: true, message: 'Service updated successfully', data: result.rows[0] });
  } catch (err) {
    console.error('updateService error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/services/:id (toggle is_active)
const toggleService = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE services SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, name, is_active`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    const s = result.rows[0];
    return res.status(200).json({ success: true, message: `Service ${s.is_active ? 'activated' : 'deactivated'}`, data: s });
  } catch (err) {
    console.error('toggleService error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getServices, getService, createService, updateService, toggleService };

const { validationResult } = require('express-validator');
const db = require('../config/database');

const STAFF_COLS = `id, name, designation, experience_years, description, specialization, image_url, is_active, created_at, updated_at`;

// GET /api/staff
const getStaff = async (req, res) => {
  try {
    const result = await db.query(`SELECT ${STAFF_COLS} FROM staff WHERE is_active = true ORDER BY name ASC`);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getStaff error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/staff/:id
const getStaffMember = async (req, res) => {
  try {
    const result = await db.query(`SELECT ${STAFF_COLS} FROM staff WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Staff member not found' });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getStaffMember error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/staff
const createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { name, designation, experience_years, description, specialization, image_url, is_active = true } = req.body;
    const result = await db.query(
      `INSERT INTO staff (name, designation, experience_years, description, specialization, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, designation || null, experience_years || 0, description || null, specialization || null, image_url || null, is_active]
    );
    return res.status(201).json({ success: true, message: 'Staff member created successfully', data: result.rows[0] });
  } catch (err) {
    console.error('createStaff error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/staff/:id
const updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { id } = req.params;
    const allowed = ['name', 'designation', 'experience_years', 'description', 'specialization', 'image_url', 'is_active'];
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (req.body[key] !== undefined) { fields.push(`${key} = $${idx++}`); values.push(req.body[key]); }
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await db.query(`UPDATE staff SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Staff member not found' });
    return res.status(200).json({ success: true, message: 'Staff member updated successfully', data: result.rows[0] });
  } catch (err) {
    console.error('updateStaff error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/staff/:id (toggle is_active)
const toggleStaff = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE staff SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, name, is_active`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Staff member not found' });
    const s = result.rows[0];
    return res.status(200).json({ success: true, message: `Staff ${s.is_active ? 'activated' : 'deactivated'}`, data: s });
  } catch (err) {
    console.error('toggleStaff error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getStaff, getStaffMember, createStaff, updateStaff, toggleStaff };

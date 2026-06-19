const { validationResult } = require('express-validator');
const db = require('../config/database');

const fetchServicesForPackages = async (packageIds) => {
  if (!packageIds.length) return {};
  const result = await db.query(
    `SELECT ps.package_id, s.id, s.name, s.description, s.original_price, s.discounted_price, s.duration, s.image_url
     FROM package_services ps
     JOIN services s ON ps.service_id = s.id
     WHERE ps.package_id = ANY($1::int[])`,
    [packageIds]
  );
  const map = {};
  for (const row of result.rows) {
    if (!map[row.package_id]) map[row.package_id] = [];
    const { package_id, ...service } = row;
    map[row.package_id].push(service);
  }
  return map;
};

const PKG_COLS = `id, name, description, type, original_price, discounted_price, benefits, is_active, created_at, updated_at`;

// GET /api/packages
const getPackages = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ${PKG_COLS} FROM packages WHERE is_active = true ORDER BY CASE type WHEN 'silver' THEN 1 WHEN 'gold' THEN 2 WHEN 'platinum' THEN 3 ELSE 4 END`
    );
    const packages = result.rows;
    if (packages.length === 0) return res.status(200).json({ success: true, data: [] });
    const packageIds = packages.map((p) => p.id);
    const servicesMap = await fetchServicesForPackages(packageIds);
    const data = packages.map((pkg) => ({ ...pkg, services: servicesMap[pkg.id] || [] }));
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getPackages error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/packages/:id
const getPackage = async (req, res) => {
  try {
    const result = await db.query(`SELECT ${PKG_COLS} FROM packages WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Package not found' });
    const pkg = result.rows[0];
    const servicesMap = await fetchServicesForPackages([pkg.id]);
    return res.status(200).json({ success: true, data: { ...pkg, services: servicesMap[pkg.id] || [] } });
  } catch (err) {
    console.error('getPackage error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/packages
const createPackage = async (req, res) => {
  const client = await db.getClient();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { name, description, type, original_price, discounted_price, benefits = [], is_active = true, service_ids = [] } = req.body;
    await client.query('BEGIN');
    const pkgResult = await client.query(
      `INSERT INTO packages (name, description, type, original_price, discounted_price, benefits, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description || null, type, original_price, discounted_price || null, JSON.stringify(benefits), is_active]
    );
    const pkg = pkgResult.rows[0];
    if (service_ids.length > 0) {
      const insertValues = service_ids.map((sid, i) => `($1, $${i + 2})`).join(', ');
      await client.query(`INSERT INTO package_services (package_id, service_id) VALUES ${insertValues}`, [pkg.id, ...service_ids]);
    }
    await client.query('COMMIT');
    const servicesMap = await fetchServicesForPackages([pkg.id]);
    return res.status(201).json({ success: true, message: 'Package created successfully', data: { ...pkg, services: servicesMap[pkg.id] || [] } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createPackage error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
};

// PUT /api/packages/:id
const updatePackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { id } = req.params;
    const allowed = ['name', 'description', 'type', 'original_price', 'discounted_price', 'is_active'];
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of allowed) {
      if (req.body[key] !== undefined) { fields.push(`${key} = $${idx++}`); values.push(req.body[key]); }
    }
    if (req.body.benefits !== undefined) { fields.push(`benefits = $${idx++}`); values.push(JSON.stringify(req.body.benefits)); }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const result = await db.query(`UPDATE packages SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Package not found' });
    const pkg = result.rows[0];
    const servicesMap = await fetchServicesForPackages([pkg.id]);
    return res.status(200).json({ success: true, message: 'Package updated successfully', data: { ...pkg, services: servicesMap[pkg.id] || [] } });
  } catch (err) {
    console.error('updatePackage error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/packages/:id
const deletePackage = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM package_services WHERE package_id = $1', [req.params.id]);
    const result = await client.query('DELETE FROM packages WHERE id = $1 RETURNING id, name', [req.params.id]);
    await client.query('COMMIT');
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Package not found' });
    return res.status(200).json({ success: true, message: 'Package deleted successfully', data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('deletePackage error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
};

// POST /api/packages/:id/services
const addService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { id } = req.params;
    const { service_id } = req.body;
    const pkgCheck = await db.query('SELECT id FROM packages WHERE id = $1', [id]);
    if (pkgCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Package not found' });
    await db.query('INSERT INTO package_services (package_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, service_id]);
    return res.status(201).json({ success: true, message: 'Service added to package' });
  } catch (err) {
    console.error('addService error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/packages/:id/services/:serviceId
const removeService = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM package_services WHERE package_id = $1 AND service_id = $2 RETURNING id',
      [req.params.id, req.params.serviceId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found in this package' });
    return res.status(200).json({ success: true, message: 'Service removed from package' });
  } catch (err) {
    console.error('removeService error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getPackages, getPackage, createPackage, updatePackage, deletePackage, addService, removeService };

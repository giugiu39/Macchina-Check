import express from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/auth.js';
import { runAsync, allAsync, getAsync } from '../db.js';

const router = express.Router();

const vehicleSchema = Joi.object({
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(2100).optional(),
  plate: Joi.string().optional().allow(''),
  vin: Joi.string().optional().allow(''),
  fuel_type: Joi.string().optional().allow(''),
  mileage: Joi.number().integer().optional(),
  registration_date: Joi.string().optional().allow(''),
  photo_path: Joi.string().optional().allow(''),
});

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const vehicles = await allAsync('SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(vehicles);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const v = value;
    const result = await runAsync(
      `INSERT INTO vehicles (user_id, make, model, year, plate, vin, fuel_type, mileage, registration_date, photo_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, v.make, v.model, v.year || null, v.plate || null, v.vin || null, v.fuel_type || null, v.mileage || null, v.registration_date || null, v.photo_path || null]
    );
    const created = await getAsync('SELECT * FROM vehicles WHERE id = ?', [result.id]);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const v = await getAsync('SELECT * FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!v) return res.status(404).json({ error: 'Veicolo non trovato' });
    res.json(v);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const v = value;
    const existing = await getAsync('SELECT * FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing) return res.status(404).json({ error: 'Veicolo non trovato' });
    await runAsync(
      `UPDATE vehicles SET make = ?, model = ?, year = ?, plate = ?, vin = ?, fuel_type = ?, mileage = ?, registration_date = ?, photo_path = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [v.make, v.model, v.year || null, v.plate || null, v.vin || null, v.fuel_type || null, v.mileage || null, v.registration_date || null, v.photo_path || null, req.params.id, req.user.id]
    );
    const updated = await getAsync('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await getAsync('SELECT * FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing) return res.status(404).json({ error: 'Veicolo non trovato' });
    await runAsync('DELETE FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
import express from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/auth.js';
import { runAsync, allAsync, getAsync } from '../db.js';

const router = express.Router();
router.use(requireAuth);

const expenseSchema = Joi.object({
  category: Joi.string().valid('insurance', 'tax', 'revision', 'maintenance', 'fuel', 'other').required(),
  title: Joi.string().allow('').optional(),
  company: Joi.string().allow('').optional(),
  policy_type: Joi.string().allow('').optional(),
  amount: Joi.number().min(0).required(),
  date: Joi.string().allow('').optional(),
  start_date: Joi.string().allow('').optional(),
  end_date: Joi.string().allow('').optional(),
  due_date: Joi.string().allow('').optional(),
  maintenance_type: Joi.string().allow('').optional(),
  note: Joi.string().allow('').optional(),
  paid: Joi.number().integer().valid(0, 1).optional(),
});

async function ownsVehicle(userId, vehicleId) {
  const v = await getAsync('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, userId]);
  return !!v;
}

router.get('/by-vehicle/:vehicleId', async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    if (!(await ownsVehicle(req.user.id, vehicleId))) return res.status(404).json({ error: 'Veicolo non trovato' });
    const rows = await allAsync('SELECT * FROM expenses WHERE vehicle_id = ? ORDER BY date DESC, created_at DESC', [vehicleId]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/by-vehicle/:vehicleId', async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    if (!(await ownsVehicle(req.user.id, vehicleId))) return res.status(404).json({ error: 'Veicolo non trovato' });
    const { error, value } = expenseSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const e = value;
    const result = await runAsync(
      `INSERT INTO expenses (vehicle_id, category, title, company, policy_type, amount, date, start_date, end_date, due_date, maintenance_type, note, paid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicleId, e.category, e.title || null, e.company || null, e.policy_type || null, e.amount, e.date || null, e.start_date || null, e.end_date || null, e.due_date || null, e.maintenance_type || null, e.note || null, e.paid ?? 0]
    );
    const created = await getAsync('SELECT * FROM expenses WHERE id = ?', [result.id]);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const exp = await getAsync('SELECT e.*, v.user_id FROM expenses e JOIN vehicles v ON e.vehicle_id = v.id WHERE e.id = ?', [req.params.id]);
    if (!exp || exp.user_id !== req.user.id) return res.status(404).json({ error: 'Spesa non trovata' });
    res.json(exp);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const exp = await getAsync('SELECT e.id, v.user_id FROM expenses e JOIN vehicles v ON e.vehicle_id = v.id WHERE e.id = ?', [req.params.id]);
    if (!exp || exp.user_id !== req.user.id) return res.status(404).json({ error: 'Spesa non trovata' });
    const e = value;
    await runAsync(
      `UPDATE expenses SET category = ?, title = ?, company = ?, policy_type = ?, amount = ?, date = ?, start_date = ?, end_date = ?, due_date = ?, maintenance_type = ?, note = ?, paid = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [e.category, e.title || null, e.company || null, e.policy_type || null, e.amount, e.date || null, e.start_date || null, e.end_date || null, e.due_date || null, e.maintenance_type || null, e.note || null, e.paid ?? 0, req.params.id]
    );
    const updated = await getAsync('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const exp = await getAsync('SELECT e.id, v.user_id FROM expenses e JOIN vehicles v ON e.vehicle_id = v.id WHERE e.id = ?', [req.params.id]);
    if (!exp || exp.user_id !== req.user.id) return res.status(404).json({ error: 'Spesa non trovata' });
    await runAsync('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
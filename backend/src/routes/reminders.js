import express from 'express';
import Joi from 'joi';
import { requireAuth } from '../middleware/auth.js';
import { runAsync, allAsync, getAsync } from '../db.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();
router.use(requireAuth);

const reminderSchema = Joi.object({
  type: Joi.string().valid('insurance', 'tax', 'revision', 'maintenance').required(),
  due_date: Joi.string().required(),
  note: Joi.string().allow('').optional(),
  notify_7d: Joi.number().integer().valid(0,1).optional(),
  notify_3d: Joi.number().integer().valid(0,1).optional(),
  notify_0d: Joi.number().integer().valid(0,1).optional(),
});

async function ownsVehicle(userId, vehicleId) {
  const v = await getAsync('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, userId]);
  return !!v;
}

router.get('/by-vehicle/:vehicleId', async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    if (!(await ownsVehicle(req.user.id, vehicleId))) return res.status(404).json({ error: 'Veicolo non trovato' });
    const rows = await allAsync('SELECT * FROM reminders WHERE vehicle_id = ? ORDER BY due_date ASC', [vehicleId]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/by-vehicle/:vehicleId', async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    if (!(await ownsVehicle(req.user.id, vehicleId))) return res.status(404).json({ error: 'Veicolo non trovato' });
    const { error, value } = reminderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const r = value;
    const result = await runAsync(
      `INSERT INTO reminders (vehicle_id, type, due_date, note, notify_7d, notify_3d, notify_0d)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vehicleId, r.type, r.due_date, r.note || null, r.notify_7d ?? 1, r.notify_3d ?? 1, r.notify_0d ?? 1]
    );
    const created = await getAsync('SELECT * FROM reminders WHERE id = ?', [result.id]);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = reminderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const r = await getAsync('SELECT r.*, v.user_id FROM reminders r JOIN vehicles v ON r.vehicle_id = v.id WHERE r.id = ?', [req.params.id]);
    if (!r || r.user_id !== req.user.id) return res.status(404).json({ error: 'Promemoria non trovato' });
    const val = value;
    await runAsync(
      `UPDATE reminders SET type = ?, due_date = ?, note = ?, notify_7d = ?, notify_3d = ?, notify_0d = ?, updated_at = datetime('now') WHERE id = ?`,
      [val.type, val.due_date, val.note || null, val.notify_7d ?? 1, val.notify_3d ?? 1, val.notify_0d ?? 1, req.params.id]
    );
    const updated = await getAsync('SELECT * FROM reminders WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const r = await getAsync('SELECT r.id, v.user_id FROM reminders r JOIN vehicles v ON r.vehicle_id = v.id WHERE r.id = ?', [req.params.id]);
    if (!r || r.user_id !== req.user.id) return res.status(404).json({ error: 'Promemoria non trovato' });
    await runAsync('DELETE FROM reminders WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Controllo e invio notifiche
router.post('/check', async (req, res, next) => {
  try {
    const rows = await allAsync(
      `SELECT r.*, u.email as user_email
       FROM reminders r
       JOIN vehicles v ON r.vehicle_id = v.id
       JOIN users u ON v.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    const now = new Date();
    let sent = 0;
    for (const r of rows) {
      const due = new Date(r.due_date);
      const days = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let should = false;
      let label = '';
      if (days === 7 && r.notify_7d) { should = true; label = '7 giorni'; }
      if (days === 3 && r.notify_3d) { should = true; label = '3 giorni'; }
      if (days === 0 && r.notify_0d) { should = true; label = 'Oggi'; }
      if (!should) continue;
      await sendEmail({
        to: r.user_email,
        subject: `Promemoria ${r.type} - scadenza ${r.due_date}`,
        text: `Promemoria (${label}): ${r.type} per veicolo #${r.vehicle_id} in scadenza il ${r.due_date}. ${r.note || ''}`,
      });
      sent++;
      await runAsync("UPDATE reminders SET last_notified_at = datetime('now') WHERE id = ?", [r.id]);
    }
    res.json({ sent });
  } catch (e) { next(e); }
});

export default router;
import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { runAsync, getAsync } from '../db.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirm_password: Joi.string().valid(Joi.ref('password')).required(),
});

router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { first_name, last_name, email, password } = value;

    const existing = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email già registrata' });

    const hash = await bcrypt.hash(password, 10);
    const result = await runAsync(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, hash]
    );

    const token = jwt.sign({ id: result.id, email }, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '7d',
    });
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { email, password } = value;

    const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Credenziali non valide' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenziali non valide' });

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '7d',
    });
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

const requestResetSchema = Joi.object({ email: Joi.string().email().required() });

router.post('/request-reset', async (req, res, next) => {
  try {
    const { error, value } = requestResetSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { email } = value;
    const user = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) return res.json({ ok: true }); // evitare enumeration

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1h
    await runAsync(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Reset password',
      text: `Per resettare la password, visita: ${resetUrl}`,
      html: `Per resettare la password, <a href="${resetUrl}">clicca qui</a>.`,
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

const resetSchema = Joi.object({ token: Joi.string().required(), password: Joi.string().min(6).required() });

router.post('/reset', async (req, res, next) => {
  try {
    const { error, value } = resetSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { token, password } = value;
    const row = await getAsync('SELECT * FROM password_resets WHERE token = ?', [token]);
    if (!row) return res.status(400).json({ error: 'Token non valido' });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'Token scaduto' });

    const hash = await bcrypt.hash(password, 10);
    await runAsync('UPDATE users SET password_hash = ? WHERE id = ?', [hash, row.user_id]);
    await runAsync('DELETE FROM password_resets WHERE token = ?', [token]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
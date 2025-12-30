import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import './db.js';
import authRouter from './routes/auth.js';
import vehiclesRouter from './routes/vehicles.js';
import expensesRouter from './routes/expenses.js';
import remindersRouter from './routes/reminders.js';
import documentsRouter from './routes/documents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Static for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/documents', documentsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Errore interno' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server in ascolto su 0.0.0.0:${PORT} (LAN access abilitato)`);
});
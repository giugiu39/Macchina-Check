import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';
import { runAsync, allAsync, getAsync } from '../db.js';

const router = express.Router();
router.use(requireAuth);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

async function ownsVehicle(userId, vehicleId) {
  const v = await getAsync('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, userId]);
  return !!v;
}

router.get('/by-vehicle/:vehicleId', async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    if (!(await ownsVehicle(req.user.id, vehicleId))) return res.status(404).json({ error: 'Veicolo non trovato' });
    const rows = await allAsync('SELECT * FROM documents WHERE vehicle_id = ? ORDER BY uploaded_at DESC', [vehicleId]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/by-vehicle/:vehicleId', upload.single('file'), async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    if (!(await ownsVehicle(req.user.id, vehicleId))) return res.status(404).json({ error: 'Veicolo non trovato' });
    const file = req.file;
    const note = req.body.note || null;
    if (!file) return res.status(400).json({ error: 'File mancante' });
    const result = await runAsync(
      `INSERT INTO documents (vehicle_id, expense_id, file_path, file_name, mime_type, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vehicleId, req.body.expense_id || null, `/uploads/${file.filename}`, file.originalname, file.mimetype, note]
    );
    const created = await getAsync('SELECT * FROM documents WHERE id = ?', [result.id]);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await getAsync('SELECT d.*, v.user_id FROM documents d JOIN vehicles v ON d.vehicle_id = v.id WHERE d.id = ?', [req.params.id]);
    if (!doc || doc.user_id !== req.user.id) return res.status(404).json({ error: 'Documento non trovato' });
    const filepath = doc.file_path.replace('/uploads/', '');
    const fullpath = path.join(uploadDir, filepath);
    await runAsync('DELETE FROM documents WHERE id = ?', [req.params.id]);
    if (fs.existsSync(fullpath)) fs.unlinkSync(fullpath);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
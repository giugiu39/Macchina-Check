import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'app.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

sqlite3.verbose();
export const db = new sqlite3.Database(dbPath);

export const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

export const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

export const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

// Run migrations on startup
import fsPromises from 'fs/promises';
const migrationsPath = path.join(__dirname, 'migrations.sql');

(async () => {
  try {
    const sql = await fsPromises.readFile(migrationsPath, 'utf-8');
    await new Promise((resolve, reject) => db.exec(sql, (err) => (err ? reject(err) : resolve())));
    console.log('Migrazioni DB eseguite.');
  } catch (e) {
    console.error('Errore migrazioni DB:', e);
  }
})();
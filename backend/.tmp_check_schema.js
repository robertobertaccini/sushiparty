import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, './database/sushi.db');
const db = new sqlite3.Database(dbPath);

db.all('PRAGMA table_info(users)', (err, rows) => {
  if (err) {
    console.error('ERR', err);
    process.exit(1);
  }
  console.log('COLUMNS:', rows.map(r => r.name).join(', '));
  db.close();
});

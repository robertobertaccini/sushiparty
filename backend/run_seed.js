import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, './database/sushi.db');
const sqlPath = path.resolve(__dirname, '../seed_users.sql');

const db = new sqlite3.Database(dbPath);
const sql = fs.readFileSync(sqlPath, 'utf8');

db.serialize(() => {
  db.exec(sql, (err) => {
    if (err) {
      console.error('Error executing SQL:', err.message);
      process.exit(1);
    } else {
      console.log('SQL script executed successfully.');
      db.close();
    }
  });
});

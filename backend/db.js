import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, './database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(__dirname, './database/sushi.db');
const db = new sqlite3.Database(dbPath);

export function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          uid TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          password TEXT,
          role TEXT,
          displayName TEXT,
          photoURL TEXT,
          city TEXT,
          availability TEXT,
          defaultCompensation REAL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          eventId TEXT PRIMARY KEY,
          clientId TEXT,
          workerId TEXT,
          date TEXT,
          city TEXT,
          participantCount INTEGER,
          status TEXT,
          totalAmount REAL,
          paidAmount REAL,
          additionalServices TEXT,
          qrCode TEXT,
          createdAt TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          messageId TEXT PRIMARY KEY,
          eventId TEXT,
          senderId TEXT,
          text TEXT,
          createdAt TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS submissions (
          photoId TEXT PRIMARY KEY,
          eventId TEXT,
          participantId TEXT,
          photoURL TEXT,
          votes TEXT,
          specialMention BOOLEAN,
          createdAt TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          minParticipants INTEGER DEFAULT 2,
          maxParticipants INTEGER DEFAULT 20,
          reservationDelayDays INTEGER DEFAULT 1
        )
      `, (err) => {
        if (err) reject(err);
        else {
          db.run('INSERT OR IGNORE INTO settings (id, minParticipants, maxParticipants, reservationDelayDays) VALUES (1, 2, 20, 1)', (errInsert) => {
            if (errInsert) console.error('Failed to insert default settings:', errInsert.message);
          });
          // Ensure the users table has the compensation column if this is an older DB
          // Ensure the users table has the compensation column if this is an older DB
          db.all(`PRAGMA table_info(users)`, (err2, columns) => {
            if (err2) {
              console.error('Failed to read users schema:', err2.message);
              return resolve(true);
            }

            const hasComp = Array.isArray(columns) && columns.some((col) => col.name === 'defaultCompensation');
            if (!hasComp) {
              db.run('ALTER TABLE users ADD COLUMN defaultCompensation REAL', (alterErr) => {
                if (alterErr) console.error('Failed to add defaultCompensation column:', alterErr.message);
                resolve(true);
              });
            } else {
              resolve(true);
            }
          });
        }
      });
    });
  });
}

export default db;
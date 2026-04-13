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
          availability TEXT
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
      `, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  });
}

export default db;
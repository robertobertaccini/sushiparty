import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb } from './db.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, './uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Initialize database
await initDb();
console.log('Database initialized');

// AUTH ROUTES
app.post('/api/auth/register', (req, res) => {
  const { email, password, role, displayName, city } = req.body;
  const uid = generateId();

  // Check if user exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (row) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    db.run(
      'INSERT INTO users (uid, email, password, role, displayName, city, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uid, email, password, role || 'client', displayName || email.split('@')[0], city || null, JSON.stringify([])],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ user: { uid, email, role: role || 'client', displayName, city } });
      }
    );
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });

    // Parse availability if it exists
    if (row.availability) {
        try { row.availability = JSON.parse(row.availability); } catch(e) {}
    }
    res.json({ user: row });
  });
});

// USERS ROUTE
app.get('/api/users', (req, res) => {
  const { role, city } = req.query;
  let query = 'SELECT uid, email, role, displayName, city, availability, photoURL FROM users WHERE 1=1';
  let params = [];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Parse JSON arrays
    rows = rows.map(r => {
        if (r.availability) {
            try { r.availability = JSON.parse(r.availability); } catch(e) {}
        }
        return r;
    });
    res.json(rows);
  });
});

// EVENTS ROUTES
app.get('/api/events', (req, res) => {
  const { clientId, workerId } = req.query;
  let query = 'SELECT * FROM events WHERE 1=1';
  let params = [];

  if (clientId) {
    query += ' AND clientId = ?';
    params.push(clientId);
  }
  if (workerId) {
    query += ' AND workerId = ?';
    params.push(workerId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/events/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE eventId = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Event not found' });
    res.json(row);
  });
});

app.post('/api/events', (req, res) => {
  const eventId = generateId();
  const { clientId, workerId, date, city, participantCount, status, totalAmount, paidAmount } = req.body;
  const createdAt = new Date().toISOString();

  db.run(
    'INSERT INTO events (eventId, clientId, workerId, date, city, participantCount, status, totalAmount, paidAmount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [eventId, clientId, workerId, date, city, participantCount, status, totalAmount, paidAmount, createdAt],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ eventId, ...req.body, createdAt });
    }
  );
});

app.put('/api/events/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE events SET status = ? WHERE eventId = ?',
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// MESSAGES ROUTES
app.get('/api/messages/:eventId', (req, res) => {
  db.all('SELECT * FROM messages WHERE eventId = ? ORDER BY createdAt ASC', [req.params.eventId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/messages', (req, res) => {
  const messageId = generateId();
  const { eventId, senderId, text } = req.body;
  const createdAt = new Date().toISOString();

  db.run(
    'INSERT INTO messages (messageId, eventId, senderId, text, createdAt) VALUES (?, ?, ?, ?, ?)',
    [messageId, eventId, senderId, text, createdAt],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ messageId, eventId, senderId, text, createdAt });
    }
  );
});

// SUBMISSIONS ROUTES
app.get('/api/submissions/:eventId', (req, res) => {
  db.all('SELECT * FROM submissions WHERE eventId = ?', [req.params.eventId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    rows = rows.map(r => {
        if (r.votes) {
            try { r.votes = JSON.parse(r.votes); } catch(e) { r.votes = []; }
        } else {
            r.votes = [];
        }
        r.specialMention = r.specialMention === 1;
        return r;
    });
    res.json(rows);
  });
});

// UPLOAD ROUTE
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const photoURL = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  const eventId = req.body.eventId;
  if (eventId) {
     const photoId = generateId();
     const participantId = req.body.participantId || 'unknown';
     const createdAt = new Date().toISOString();
     db.run(
        'INSERT INTO submissions (photoId, eventId, participantId, photoURL, votes, specialMention, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [photoId, eventId, participantId, photoURL, JSON.stringify([]), false, createdAt],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ photoURL, photoId });
        }
     );
  } else {
     res.json({ photoURL });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

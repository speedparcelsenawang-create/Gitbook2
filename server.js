import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeDocumentState } from './src/data-store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '12mb' }));

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false
});

async function ensureDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/docbook', async (_req, res) => {
  try {
    const result = await pool.query('SELECT data FROM app_state WHERE id = $1', ['docbook']);

    if (!result.rows[0]) {
      const defaultState = normalizeDocumentState({ pages: null, activeId: null });
      await pool.query('INSERT INTO app_state (id, data) VALUES ($1, $2)', ['docbook', JSON.stringify(defaultState)]);
      return res.json(defaultState);
    }

    res.json(result.rows[0].data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/docbook', async (req, res) => {
  try {
    const state = normalizeDocumentState(req.body || {});
    await pool.query(
      `INSERT INTO app_state (id, data) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      ['docbook', JSON.stringify(state)]
    );
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/imgbb-upload', async (req, res) => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ImgBB belum dikonfigurasi. Tambah Secret IMGBB_API_KEY dahulu.' });
  }

  const image = typeof req.body?.image === 'string' ? req.body.image : '';
  const match = image.match(/^data:(image\/(?:png|jpeg|jpg|gif|webp));base64,([a-zA-Z0-9+/=\s]+)$/);
  if (!match) {
    return res.status(400).json({ error: 'Fail imej tidak sah.' });
  }

  const base64Image = match[2].replace(/\s/g, '');
  const imageSize = Math.ceil((base64Image.length * 3) / 4);
  if (imageSize > 8 * 1024 * 1024) {
    return res.status(413).json({ error: 'Saiz imej melebihi had 8MB.' });
  }

  try {
    const body = new URLSearchParams({
      key: apiKey,
      image: base64Image
    });
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success || !result.data?.url) {
      console.error('ImgBB upload failed:', response.status, result?.error?.message || 'Unknown provider error');
      return res.status(502).json({ error: 'ImgBB gagal menerima imej. Sila cuba lagi.' });
    }

    return res.json({ url: result.data.url });
  } catch (error) {
    console.error('ImgBB request failed:', error.message);
    return res.status(502).json({ error: 'Tidak dapat menyambung ke ImgBB. Sila cuba lagi.' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

export function isSpaRoute(pathname) {
  return typeof pathname === 'string' && !pathname.startsWith('/api');
}

app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

async function start() {
  await ensureDatabase();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  start();
}

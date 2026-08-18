const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'opal_dev_secret';

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const JOBS_DIR = path.join(__dirname, 'jobs');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(JOBS_DIR)) fs.mkdirSync(JOBS_DIR, { recursive: true });

const USERS_FILE = path.join(__dirname, 'users.json');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE);
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, name);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'opal-backend' });
});

app.get('/', (req, res) => {
  res.send('Opal backend — prototype');
});

// Simple auth: register / login
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

    const users = readUsers();
    if (users.find(u => u.email === email)) return res.status(400).json({ error: 'user_exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), email, password: hashed, createdAt: new Date().toISOString() };
    users.push(user);
    writeUsers(users);

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'register_failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'invalid_credentials' });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'login_failed' });
  }
});

// Auth middleware
function ensureAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no_auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid_auth_format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// Upload endpoint (multipart/form-data, field: file) - protected
app.post('/upload', ensureAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Export endpoint (enqueue job) - protected
app.post('/export', ensureAuth, async (req, res) => {
  try {
    const { media, output = 'output.mp4' } = req.body;
    if (!media || !Array.isArray(media) || media.length === 0) return res.status(400).json({ error: 'no_media' });

    const jobId = uuidv4();
    const job = {
      id: jobId,
      media,
      output,
      status: 'pending',
      createdAt: new Date().toISOString(),
      result: null,
      error: null
    };

    fs.writeFileSync(path.join(JOBS_DIR, `${jobId}.json`), JSON.stringify(job, null, 2));

    res.json({ jobId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'enqueue_failed' });
  }
});

// Get job status
app.get('/export/status/:id', ensureAuth, (req, res) => {
  const id = req.params.id;
  const file = path.join(JOBS_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'job_not_found' });
  const job = JSON.parse(fs.readFileSync(file));
  res.json({ id: job.id, status: job.status, result: job.result, error: job.error });
});

app.listen(port, () => {
  console.log(`Opal backend listening on port ${port}`);
});

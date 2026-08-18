const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'opal_dev_secret';

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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

// Upload endpoint (multipart/form-data, field: file)
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Export endpoint (POST JSON) - accepts { media: [{ url, type }] }
app.post('/export', async (req, res) => {
  try {
    const { media, output = 'output.mp4' } = req.body;
    if (!media || !Array.isArray(media) || media.length === 0) return res.status(400).json({ error: 'no_media' });

    // For MVP we'll only concat video files (skip images)
    const videoItems = media.filter(m => m.type === 'video' || (m.url && m.url.match(/\.(mp4|mov|mkv|webm)(\?|$)/i)));
    if (videoItems.length === 0) return res.status(400).json({ error: 'no_video_items' });

    const downloaded = [];
    for (const item of videoItems) {
      const url = item.url;
      const filename = path.join(UPLOAD_DIR, `${Date.now()}-${path.basename(url).split('?')[0]}`);
      const writer = fs.createWriteStream(filename);
      const response = await axios.get(url, { responseType: 'stream' });
      await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      downloaded.push(filename);
    }

    const listFile = path.join(UPLOAD_DIR, `list-${Date.now()}.txt`);
    const listContent = downloaded.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync(listFile, listContent);

    const outFilename = path.join(UPLOAD_DIR, `${Date.now()}-${output}`);

    // Use ffmpeg concat demuxer
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c', 'copy'])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outFilename);
    });

    const outUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(outFilename)}`;
    res.json({ url: outUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'export_failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Opal backend listening on port ${port}`);
});

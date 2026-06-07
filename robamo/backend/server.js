require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests. Please try again later.' } });
app.use('/api/', limiter);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://robamo-v3-node22.vercel.app',
  'https://robamo-v3-node22-ovp2vgqcb-shafaqueafrins-projects.vercel.app',
];
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(session({
  secret: process.env.SESSION_SECRET || 'robamo_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Init DB
const db = require('./config/database');

// Auto-create admin
const adminExists = db.prepare('SELECT id FROM admins WHERE email = ?').get(process.env.ADMIN_EMAIL || 'admin@robamo.in');
if (!adminExists) {
  const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
  db.prepare('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)').run('ROBAMO Admin', process.env.ADMIN_EMAIL || 'admin@robamo.in', hashed);
  console.log('✅ Default admin created — Email: admin@robamo.in | Password: Admin@123');
}

app.use('/api', require('./routes/index'));

// Serve frontend
const frontendPath = path.join(__dirname, '../frontend/public');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ success: false, message: 'API route not found.' });
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log('\n🤖 ══════════════════════════════════');
  console.log(`   ROBAMO Backend running on :${PORT}`);
  console.log(`   🌐 API:     http://localhost:${PORT}/api`);
  console.log(`   🌍 Website: http://localhost:${PORT}`);
  console.log('   ══════════════════════════════════\n');
});

module.exports = app;

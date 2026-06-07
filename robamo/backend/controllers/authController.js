const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ── ADMIN LOGIN ──
const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin', name: admin.name }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ success: true, message: 'Login successful', token, admin: { id: admin.id, name: admin.name, email: admin.email } });
};

// ── USER REGISTER ──
const userRegister = (req, res) => {
  const { name, email, phone, password, city, school_name } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, phone, password, city, school_name) VALUES (?, ?, ?, ?, ?, ?)').run(name, email, phone || null, hashed, city || null, school_name || null);
  const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'student', name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ success: true, message: 'Registration successful!', token, user: { id: result.lastInsertRowid, name, email } });
};

// ── USER LOGIN ──
const userLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
};

// ── GET PROFILE ──
const getProfile = (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, city, school_name, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, user });
};

module.exports = { adminLogin, userRegister, userLogin, getProfile };

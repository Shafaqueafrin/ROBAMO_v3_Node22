const db = require('../config/database');

// ── STUDENT REGISTRATION ──
const submitRegistration = (req, res) => {
  const { student_name, age, grade, course_id, course_name, parent_name, phone, email, school_name, city } = req.body;
  if (!student_name || !grade || !parent_name || !phone || !email || !city)
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });

  const result = db.prepare(`INSERT INTO registrations (student_name, age, grade, course_id, course_name, parent_name, phone, email, school_name, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(student_name, age || null, grade, course_id || null, course_name || null, parent_name, phone, email, school_name || null, city);
  res.status(201).json({ success: true, message: 'Registration successful! We will contact you within 24 hours. 🎉', id: result.lastInsertRowid });
};

const getAllRegistrations = (req, res) => {
  const regs = db.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all();
  res.json({ success: true, registrations: regs, total: regs.length });
};

const updateRegistrationStatus = (req, res) => {
  const { status, notes } = req.body;
  db.prepare('UPDATE registrations SET status = ?, notes = ? WHERE id = ?').run(status, notes || null, req.params.id);
  res.json({ success: true, message: 'Status updated.' });
};

// ── DEMO BOOKING ──
const bookDemo = (req, res) => {
  const { name, phone, city, user_type, email, school_name, preferred_date } = req.body;
  if (!name || !phone)
    return res.status(400).json({ success: false, message: 'Name and phone are required.' });

  const result = db.prepare(`INSERT INTO demo_bookings (name, phone, city, user_type, email, school_name, preferred_date) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(name, phone, city || null, user_type || 'parent', email || null, school_name || null, preferred_date || null);
  res.status(201).json({ success: true, message: 'Demo booked! We will call you within 24 hours. 📞', id: result.lastInsertRowid });
};

const getAllDemoBookings = (req, res) => {
  const bookings = db.prepare('SELECT * FROM demo_bookings ORDER BY created_at DESC').all();
  res.json({ success: true, bookings, total: bookings.length });
};

// ── SCHOOL PARTNERSHIP ──
const submitPartnership = (req, res) => {
  const { school_name, contact_name, phone, city, student_count, email, message } = req.body;
  if (!school_name || !contact_name || !phone || !city)
    return res.status(400).json({ success: false, message: 'School name, contact, phone and city are required.' });

  const result = db.prepare(`INSERT INTO school_partnerships (school_name, contact_name, phone, city, student_count, email, message) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(school_name, contact_name, phone, city, student_count || null, email || null, message || null);
  res.status(201).json({ success: true, message: 'Partnership request submitted! We will contact you within 24 hours. 🏫', id: result.lastInsertRowid });
};

const getAllPartnerships = (req, res) => {
  const partnerships = db.prepare('SELECT * FROM school_partnerships ORDER BY created_at DESC').all();
  res.json({ success: true, partnerships, total: partnerships.length });
};

// ── CONTACT ──
const submitContact = (req, res) => {
  const { name, email, phone, user_type, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });

  const result = db.prepare(`INSERT INTO contact_messages (name, email, phone, user_type, message) VALUES (?, ?, ?, ?, ?)`).run(name, email, phone || null, user_type || 'parent', message);
  res.status(201).json({ success: true, message: 'Message sent! We will reply within 2 hours. ✅', id: result.lastInsertRowid });
};

const getAllMessages = (req, res) => {
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  res.json({ success: true, messages, total: messages.length });
};

module.exports = { submitRegistration, getAllRegistrations, updateRegistrationStatus, bookDemo, getAllDemoBookings, submitPartnership, getAllPartnerships, submitContact, getAllMessages };

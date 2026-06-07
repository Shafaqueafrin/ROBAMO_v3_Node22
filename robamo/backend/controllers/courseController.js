const db = require('../config/database');

const getAllCourses = (req, res) => {
  const { grade } = req.query;
  let query = 'SELECT * FROM courses WHERE is_active = 1';
  const params = [];
  if (grade && grade !== 'all') { query += ' AND grade_level = ?'; params.push(grade); }
  query += ' ORDER BY id ASC';
  const courses = db.prepare(query).all(...params);
  res.json({ success: true, courses });
};

const getCourseById = (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  // Get modules
  const modules = db.prepare('SELECT * FROM course_modules WHERE course_id = ? AND is_active = 1 ORDER BY module_number ASC').all(req.params.id);

  // Get lessons for each module
  const modulesWithLessons = modules.map(mod => {
    const lessons = db.prepare('SELECT * FROM course_lessons WHERE module_id = ? AND is_active = 1 ORDER BY lesson_number ASC').all(mod.id);
    return { ...mod, lessons };
  });

  // Stats
  const totalLessons = db.prepare('SELECT COUNT(*) as cnt FROM course_lessons WHERE course_id = ? AND is_active = 1').get(req.params.id).cnt;
  const freeLessons = db.prepare('SELECT COUNT(*) as cnt FROM course_lessons WHERE course_id = ? AND is_free = 1').get(req.params.id).cnt;

  res.json({ success: true, course, modules: modulesWithLessons, totalLessons, freeLessons });
};

const getCourseModules = (req, res) => {
  const modules = db.prepare('SELECT * FROM course_modules WHERE course_id = ? AND is_active = 1 ORDER BY module_number ASC').all(req.params.id);
  res.json({ success: true, modules });
};

// ADMIN
const createCourse = (req, res) => {
  const { title, description, grade_level, duration_hours, modules, difficulty, price, emoji, color_class, what_you_learn, requirements } = req.body;
  if (!title || !grade_level) return res.status(400).json({ success: false, message: 'Title and grade_level required.' });
  const result = db.prepare('INSERT INTO courses (title,description,grade_level,duration_hours,modules,difficulty,price,emoji,color_class,what_you_learn,requirements) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(title, description, grade_level, duration_hours||0, modules||0, difficulty||'Beginner', price||0, emoji||'🤖', color_class||'purple', what_you_learn||null, requirements||null);
  res.status(201).json({ success: true, message: 'Course created!', id: result.lastInsertRowid });
};

const updateCourse = (req, res) => {
  const { title, description, grade_level, duration_hours, modules, difficulty, price, emoji, color_class, is_active, what_you_learn, requirements } = req.body;
  db.prepare('UPDATE courses SET title=?,description=?,grade_level=?,duration_hours=?,modules=?,difficulty=?,price=?,emoji=?,color_class=?,is_active=?,what_you_learn=?,requirements=? WHERE id=?').run(title, description, grade_level, duration_hours, modules, difficulty, price, emoji, color_class, is_active, what_you_learn||null, requirements||null, req.params.id);
  res.json({ success: true, message: 'Course updated!' });
};

const deleteCourse = (req, res) => {
  db.prepare('UPDATE courses SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Course deleted.' });
};

// ADMIN: Add module to course
const addModule = (req, res) => {
  const { module_number, title, description, duration_hours } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Title required.' });
  const result = db.prepare('INSERT INTO course_modules (course_id,module_number,title,description,duration_hours) VALUES (?,?,?,?,?)').run(req.params.id, module_number||1, title, description||'', duration_hours||1);
  res.status(201).json({ success: true, message: 'Module added!', id: result.lastInsertRowid });
};

// ADMIN: Add lesson to module
const addLesson = (req, res) => {
  const { module_id, lesson_number, title, description, lesson_type, duration_minutes, is_free } = req.body;
  if (!title || !module_id) return res.status(400).json({ success: false, message: 'Title and module_id required.' });
  const result = db.prepare('INSERT INTO course_lessons (module_id,course_id,lesson_number,title,description,lesson_type,duration_minutes,is_free) VALUES (?,?,?,?,?,?,?,?)').run(module_id, req.params.id, lesson_number||1, title, description||'', lesson_type||'video', duration_minutes||30, is_free||0);
  res.status(201).json({ success: true, message: 'Lesson added!', id: result.lastInsertRowid });
};

module.exports = { getAllCourses, getCourseById, getCourseModules, createCourse, updateCourse, deleteCourse, addModule, addLesson };

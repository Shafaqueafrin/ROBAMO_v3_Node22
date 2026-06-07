const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://robamo-v3-node22-5.onrender.com/api';
  
async function apiCall(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + endpoint, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

const Auth = {
  login: (email, password) => apiCall('POST', '/auth/login', { email, password }),
  register: (data) => apiCall('POST', '/auth/register', data),
  adminLogin: (email, password) => apiCall('POST', '/auth/admin/login', { email, password }),
  profile: () => apiCall('GET', '/auth/profile', null, getToken()),
  logout: () => { localStorage.removeItem('robamo_token'); localStorage.removeItem('robamo_user'); window.location.href = '/'; },
};

const Courses = {
  getAll: (grade) => apiCall('GET', `/courses${grade ? '?grade=' + encodeURIComponent(grade) : ''}`),
  getById: (id) => apiCall('GET', `/courses/${id}`),
  getModules: (id) => apiCall('GET', `/courses/${id}/modules`),
  create: (data) => apiCall('POST', '/courses', data, getToken()),
  update: (id, data) => apiCall('PUT', `/courses/${id}`, data, getToken()),
  delete: (id) => apiCall('DELETE', `/courses/${id}`, null, getToken()),
};

const Forms = {
  register: (data) => apiCall('POST', '/register', data),
  bookDemo: (data) => apiCall('POST', '/demo', data),
  partnership: (data) => apiCall('POST', '/partnership', data),
  contact: (data) => apiCall('POST', '/contact', data),
};

const Public = {
  getShowcase: () => apiCall('GET', '/showcase'),
  getTestimonials: () => apiCall('GET', '/testimonials'),
  getBlog: () => apiCall('GET', '/blog'),
  getBlogById: (id) => apiCall('GET', `/blog/${id}`),
  getDownloads: () => apiCall('GET', '/downloads'),
  trackDownload: (id) => apiCall('POST', `/downloads/${id}/track`),
};

const Admin = {
  stats: () => apiCall('GET', '/admin/stats', null, getToken()),
  registrations: () => apiCall('GET', '/admin/registrations', null, getToken()),
  updateRegistration: (id, data) => apiCall('PUT', `/admin/registrations/${id}`, data, getToken()),
  demos: () => apiCall('GET', '/admin/demos', null, getToken()),
  partnerships: () => apiCall('GET', '/admin/partnerships', null, getToken()),
  messages: () => apiCall('GET', '/admin/messages', null, getToken()),
};

// Token helpers
function getToken() { return localStorage.getItem('robamo_token'); }
function setToken(t) { localStorage.setItem('robamo_token', t); }
function getUser() { const u = localStorage.getItem('robamo_user'); return u ? JSON.parse(u) : null; }
function setUser(u) { localStorage.setItem('robamo_user', JSON.stringify(u)); }

// Form data helper
function getFormData(form) {
  const data = {};
  new FormData(form).forEach((v, k) => { data[k] = v; });
  return data;
}

// Toast
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('globalToast') || document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 4000);
}

// Button loader
function showLoader(btn) { if (btn) { btn.dataset.orig = btn.textContent; btn.textContent = ''; btn.innerHTML = '<div class="spinner" style="display:inline-block;width:18px;height:18px;border-width:2px;vertical-align:middle;"></div>'; btn.disabled = true; } }
function hideLoader(btn) { if (btn && btn.dataset.orig) { btn.innerHTML = btn.dataset.orig; btn.disabled = false; } }

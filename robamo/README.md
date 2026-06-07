# 🤖 ROBAMO v2.0 — AI & Robotics Education Platform
## Node.js 22 LTS Compatible ✅

---

## ⚡ Quick Start (Node 22 LTS)

### Step 1 — Install dependencies
```bash
cd backend
npm install
```

> ⚠️ If you get a `better-sqlite3` build error, run this instead:
> ```bash
> npm install --build-from-source
> ```
> OR install build tools first (Windows):
> ```bash
> npm install --global windows-build-tools
> npm install
> ```

### Step 2 — Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

### Step 3 — Open website
Browser mein kholo: **http://localhost:5000**

---

## 🔐 Admin Login
- URL: http://localhost:5000/pages/admin.html
- Email: **admin@robamo.in**  
- Password: **Admin@123**

---

## 📋 Node.js Requirements
- **Node.js**: 18, 20, or **22 LTS** ✅
- **npm**: 9.x or higher
- **better-sqlite3 v11**: Native module — needs C++ build tools

### Windows — Install Build Tools (one time):
```bash
npm install --global windows-build-tools
```
OR install Visual Studio Build Tools from Microsoft website.

### Mac — Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### Linux/Ubuntu:
```bash
sudo apt-get install build-essential
```

---

## 📁 Project Structure
```
robamo/
├── backend/                    ← Node.js + Express API
│   ├── config/database.js      ← SQLite DB + all seed data
│   ├── controllers/            ← Business logic
│   ├── middleware/auth.js      ← JWT auth
│   ├── routes/index.js         ← All API routes
│   ├── server.js               ← Entry point
│   ├── .env                    ← Environment variables
│   └── .npmrc                  ← npm config (engine-strict=false)
└── frontend/public/
    ├── index.html              ← Homepage (animated ring, all sections)
    ├── css/style.css           ← Complete stylesheet
    ├── js/api.js               ← API helper
    └── pages/
        ├── courses.html        ← All courses with filters
        ├── course-detail.html  ← Course + expandable curriculum
        ├── blog-detail.html    ← Full blog article
        ├── dashboard.html      ← Student dashboard
        └── admin.html          ← Admin panel
```

---

## 🌐 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses | All courses |
| GET | /api/courses/:id | Course + modules + lessons |
| GET | /api/testimonials | Testimonials |
| GET | /api/blog | Blog posts |
| GET | /api/blog/:id | Single blog post |
| GET | /api/showcase | Student projects |
| GET | /api/downloads | Downloadable resources |
| POST | /api/demo | Book demo |
| POST | /api/register | Student registration |
| POST | /api/partnership | School partnership |
| POST | /api/contact | Contact message |
| POST | /api/auth/login | User login |
| POST | /api/auth/admin/login | Admin login |
| GET | /api/admin/stats | Admin dashboard stats |

---

## 💬 WhatsApp Number Change Karo
`+91 98765 43210` ko apna number se replace karo in:
- `frontend/public/index.html` — search `9876543210`
- `frontend/public/pages/course-detail.html`
- `frontend/public/pages/blog-detail.html`

---

## ✅ Features List
- ✅ Animated rotating ring (homepage hero)
- ✅ All sections with real images
- ✅ 6 courses with full curriculum
- ✅ Expandable module/lesson accordion
- ✅ 10 blog posts with full content
- ✅ WhatsApp floating button (every page)
- ✅ Demo booking, registration, contact forms
- ✅ School partnership form
- ✅ Admin panel with stats
- ✅ JWT authentication
- ✅ Mobile responsive
- ✅ Node.js 22 LTS compatible

# 🏥 Y's Hospitals – Doctor Appointment Booking System

A full-stack, production-ready healthcare web application with patient registration, doctor listing, appointment booking, and an admin dashboard.

---

## 📁 Project Structure

```
ys-hospitals/
├── client/
│   └── index.html              # Complete frontend (single-file SPA)
├── server/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── email.js            # Nodemailer email config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + adminOnly
│   │   └── error.js            # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   └── appointments.js
│   ├── index.js                # Express server entry
│   ├── seed.js                 # Seed sample doctors & admin
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start (Local)

### 1. Clone & Setup

```bash
git clone https://github.com/your-repo/ys-hospitals.git
cd ys-hospitals/server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values:
# - MONGODB_URI (MongoDB Atlas connection string)
# - JWT_SECRET (any random string)
# - EMAIL_USER / EMAIL_PASS (Gmail App Password for email)
```

### 3. Seed the Database

```bash
node seed.js
# Creates 8 sample doctors + admin account
# Admin: admin@yshospitals.com / Admin@1234
```

### 4. Start Backend

```bash
npm run dev       # Development (nodemon)
# OR
npm start         # Production
# Server runs on http://localhost:5000
```

### 5. Open Frontend

Simply open `client/index.html` in your browser.
> For production, serve it via Vercel, Netlify, or any static host.

---

## 🗄️ Database Setup (MongoDB Atlas)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (for cloud deployment)
5. Get the connection string → paste into `.env` as `MONGODB_URI`

---

## ☁️ Deployment

### Backend → Render

1. Push `server/` folder to GitHub
2. Go to [https://render.com](https://render.com) → New Web Service
3. Connect your repo
4. **Build Command:** `npm install`
5. **Start Command:** `node index.js`
6. Add all `.env` variables in Render's Environment tab
7. Deploy → copy the URL (e.g. `https://ys-hospitals-api.onrender.com`)

### Frontend → Vercel

1. Update `API` const in `client/index.html`:
   ```js
   const API = 'https://ys-hospitals-api.onrender.com/api';
   ```
2. Push `client/` to GitHub
3. Go to [https://vercel.com](https://vercel.com) → New Project
4. Import repo → deploy (no build config needed for static HTML)
5. Set env var: `REACT_APP_API_URL=https://ys-hospitals-api.onrender.com/api`

### CORS

In `server/.env`, set:
```
CLIENT_URL=https://your-vercel-url.vercel.app
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register patient |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all (with search/filter) |
| GET | `/api/doctors/:id` | Doctor details |
| GET | `/api/doctors/specializations` | Unique specializations |
| POST | `/api/doctors` | Add doctor (admin only) |
| PUT | `/api/doctors/:id` | Update doctor (admin only) |
| DELETE | `/api/doctors/:id` | Delete doctor (admin only) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/my` | My appointments |
| GET | `/api/appointments/booked-slots` | Get booked slots for date |
| PUT | `/api/appointments/:id/cancel` | Cancel appointment |
| GET | `/api/appointments/admin/all` | All appointments (admin) |
| GET | `/api/appointments/admin/analytics` | Dashboard analytics (admin) |
| PUT | `/api/appointments/:id/status` | Update status (admin) |

---

## 👤 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@yshospitals.com | Admin@1234 |
| Patient | Register on the site | Your choice |

---

## 🚀 Features

- ✅ JWT Authentication (register/login/logout)
- ✅ Role-based access (Patient vs Admin)
- ✅ Doctor listing with search & filter
- ✅ Real-time booked slot detection (prevent double booking)
- ✅ Appointment booking with email confirmation
- ✅ Appointment cancellation (patient & admin)
- ✅ Admin analytics dashboard (revenue, counts, top doctors)
- ✅ Admin: manage doctors (add/delete) and appointments (complete/cancel)
- ✅ Profile management
- ✅ Responsive mobile-first design
- ✅ Toast notifications
- ✅ MongoDB Atlas + Render + Vercel ready

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS (SPA) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 📧 Email Setup (Gmail)

1. Enable 2-factor auth on Gmail
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Use that 16-char password as `EMAIL_PASS` in `.env`

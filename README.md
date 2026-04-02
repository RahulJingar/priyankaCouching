# Priyanka Coaching - MERN Stack Website

## Setup & Run

### Prerequisites
- Node.js installed
- MongoDB running locally (or MongoDB Atlas)

### Backend Setup
```bash
cd backend
npm install
# MongoDB local pe run ho raha ho, ya .env mein MONGO_URI update karo
npm run dev
```
Server: http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
App: http://localhost:3000

---

## Roles & Access

| Role | Access |
|------|--------|
| **Guest** | Homepage, Course listing, Preview video |
| **Student** | Signup/Login, Buy courses, Watch full content |
| **Teacher** | Dashboard - revenue, students, manage courses |

### Teacher Login
- Email: `priyankakhinchi@mailinator.com`
- Password: `Priyanka@khinchi123`

---

## Features
- 3-role system (Guest / Student / Teacher)
- JWT Authentication with validation
- YouTube video preview (free) + full lessons (paid)
- Course enrollment / payment simulation
- Teacher dashboard with revenue & student analytics
- Add/Delete courses from dashboard
- Search & filter courses by category
- Responsive UI with purple theme

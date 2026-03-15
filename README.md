# UniCore LMS 🎓

**A Microservices-Based Learning Management System for Universities**

> B.Tech Major Project | Microservices Architecture | Node.js · React · MongoDB · Docker

---

## 📋 Project Overview

UniCore LMS solves the core limitations of monolithic university platforms by splitting every major function into an independently deployable, scalable microservice.

| Problem (Monolith) | Solution (UniCore) |
|---|---|
| One failure takes down everything | Fault-isolated services |
| Hard to scale specific features | Per-service horizontal scaling |
| Full redeployment for small updates | Independent CI/CD per service |
| Database coupling | Separate DB per service |
| Hard to extend | Add new services without touching others |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐
│       React Frontend        │  (Vite · TailwindCSS · Recharts)
│       localhost:5173        │
└──────────────┬──────────────┘
               │ REST API
┌──────────────▼──────────────┐
│         API Gateway         │  Port 3000
│  Rate Limiting · JWT Auth   │
│  Request Routing · Logging  │
└──┬────┬────┬────┬────┬──────┘
   │    │    │    │    │
┌──▼─┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──────┐
│User│ │Crs│ │Asm│ │Ntf│ │Anlytc │
│Svc │ │Svc│ │Svc│ │Svc│ │  Svc  │
│3001│ │3002│ │3003│ │3004│ │ 3005 │
└──┬─┘ └┬──┘ └┬──┘ └┬──┘ └┬──────┘
   │    │    │    │    │
┌──▼────▼────▼────▼────▼──────────┐
│         MongoDB Cluster          │
│  (One database per service)      │
└──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Recharts, React Router 6 |
| Backend | Node.js 18, Express.js |
| Database | MongoDB 6 (Mongoose ODM) |
| Auth | JWT (access + refresh tokens) |
| Gateway | http-proxy-middleware, express-rate-limit |
| DevOps | Docker, Docker Compose |
| Logging | Winston |

---

## 📁 Project Structure

```
unicore-lms/
├── api-gateway/              # Single entry point (Port 3000)
│   └── src/index.js
├── user-service/             # Auth + User Management (Port 3001)
│   └── src/
│       ├── config/           # DB, logger
│       ├── controllers/      # authController, userController
│       ├── middleware/        # auth, errorHandler
│       ├── models/           # User.js
│       └── routes/           # authRoutes, userRoutes
├── course-service/           # Courses + Enrollments (Port 3002)
├── assessment-service/       # Assignments + Quizzes (Port 3003)
├── notification-service/     # Alerts + Announcements (Port 3004)
├── analytics-service/        # Dashboards + Metrics (Port 3005)
├── frontend/                 # React SPA
│   └── src/
│       ├── pages/            # HomePage, Login, Register, Dashboards
│       ├── components/       # DashboardLayout, StatsCard
│       ├── context/          # AuthContext
│       └── services/         # api.js (Axios)
└── docker-compose.yml        # Orchestrates all services
```

---

## 🚀 Setup & Running

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (optional — handled by Docker)

---

### Option A: Docker (Recommended)

```bash
# 1. Clone the project
git clone <your-repo-url>
cd unicore-lms

# 2. Copy environment files (already configured for Docker)
#    Each service uses defaults from docker-compose.yml

# 3. Start all services
docker-compose up --build

# 4. Open browser
#    Frontend:  http://localhost:5173
#    API:       http://localhost:3000
```

---

### Option B: Manual (Development)

**Step 1 — Start MongoDB**
```bash
# Using Docker just for MongoDB
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

**Step 2 — Setup each service**
```bash
# User Service
cd user-service
cp .env.example .env
# Edit .env: set MONGO_URI=mongodb://localhost:27017/unicore_users
npm install && npm run dev

# Course Service (new terminal)
cd course-service
cp .env.example .env
npm install && npm run dev

# Assessment Service
cd assessment-service && npm install && npm run dev

# Notification Service
cd notification-service && npm install && npm run dev

# Analytics Service
cd analytics-service && npm install && npm run dev

# API Gateway
cd api-gateway && npm install && npm run dev
```

**Step 3 — Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Step 4 — Open** `http://localhost:5173`

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@unicore.edu | admin123 |
| Faculty | faculty@unicore.edu | faculty123 |
| Student | student@unicore.edu | student123 |

> **Note:** Register these accounts manually on first run, or seed them via a script.

---

## 📡 Key API Endpoints

### Auth (via Gateway → User Service)
```
POST /api/auth/register     Register new user
POST /api/auth/login        Login and get JWT tokens
GET  /api/auth/me           Get current user profile
POST /api/auth/logout       Logout
POST /api/auth/refresh-token Refresh access token
```

### Users (Admin)
```
GET    /api/users           List all users
GET    /api/users/stats     User statistics
PUT    /api/users/:id       Update user
DELETE /api/users/:id       Delete user
```

### Courses
```
GET    /api/courses         List courses
POST   /api/courses         Create course
GET    /api/courses/:id     Get course details
PUT    /api/courses/:id     Update course
POST   /api/courses/:id/enroll  Enroll student
GET    /api/courses/student/:id/enrolled  Student's courses
```

### Assessments
```
POST /api/assessments/assignments             Create assignment
GET  /api/assessments/assignments/course/:id  Get by course
POST /api/assessments/assignments/:id/submit  Submit
POST /api/assessments/quizzes                 Create quiz
POST /api/assessments/quizzes/:id/submit      Submit quiz (auto-graded)
PUT  /api/assessments/submissions/:id/grade   Grade submission
```

### Notifications
```
GET  /api/notifications/my          My notifications
PUT  /api/notifications/mark-read   Mark as read
POST /api/notifications/broadcast   Broadcast to role
```

### Analytics
```
GET /api/analytics/admin/overview      Admin metrics
GET /api/analytics/student/:id         Student progress
GET /api/analytics/faculty/:id         Faculty analytics
GET /api/analytics/system-health       Service health
```

---

## 🔑 Environment Variables

### user-service/.env
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/unicore_users
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=1d
```

### api-gateway/.env
```
PORT=3000
JWT_SECRET=your_jwt_secret      # must match user-service
CLIENT_URL=http://localhost:5173
USER_SERVICE_URL=http://localhost:3001
COURSE_SERVICE_URL=http://localhost:3002
ASSESSMENT_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
ANALYTICS_SERVICE_URL=http://localhost:3005
```

---

## 🩺 Health Checks

Each service exposes a health endpoint:
```bash
curl http://localhost:3000/health   # Gateway
curl http://localhost:3001/health   # User Service
curl http://localhost:3002/health   # Course Service
curl http://localhost:3003/health   # Assessment Service
curl http://localhost:3004/health   # Notification Service
curl http://localhost:3005/health   # Analytics Service
```

Expected response:
```json
{ "status": "UP", "service": "user-service", "timestamp": "..." }
```

---

## 📊 Database Design

| Collection | Service | Key Fields |
|---|---|---|
| `users` | user-service | name, email, password, role, department |
| `courses` | course-service | title, code, facultyId, status, enrolledCount |
| `enrollments` | course-service | studentId, courseId, progress, grade |
| `assignments` | assessment-service | title, courseId, facultyId, dueDate, totalMarks |
| `quizzes` | assessment-service | questions[], startTime, endTime, duration |
| `submissions` | assessment-service | type, assessmentId, studentId, marksObtained, grade |
| `notifications` | notification-service | recipientId, type, title, message, isRead |
| `analyticsnapshots` | analytics-service | type, entityId, data, recordedAt |

---

## 🔮 Future Enhancements

1. **RabbitMQ / Kafka** — Event-driven notification triggers (assignment created → auto-notify enrolled students)
2. **Redis Caching** — Cache course lists, user sessions, analytics snapshots
3. **File Upload Service** — Dedicated microservice for assignment file submissions (S3/MinIO)
4. **WebSocket Notifications** — Real-time alerts using Socket.io
5. **Attendance Service** — Dedicated microservice for QR-based attendance tracking
6. **Video Streaming Service** — Chunked video delivery for lecture content
7. **CI/CD Pipeline** — GitHub Actions → Docker Hub → Kubernetes
8. **Kubernetes Deployment** — HPA for auto-scaling individual services under load
9. **API Documentation** — Swagger/OpenAPI spec for all services
10. **Service Mesh** — Istio for advanced traffic management and mTLS

---

## 👨‍💻 About

**Project:** UniCore LMS — Microservices-Based Learning Management System  
**Type:** B.Tech Major Project (University Problem Statement)  
**Stack:** Full Stack · Microservices Architecture  

Built to demonstrate practical microservices design principles:
- **Loose coupling** between services
- **High cohesion** within each service  
- **Fault isolation** — service failures don't cascade
- **Independent deployability** — update any service without touching others
- **Polyglot persistence** — separate database per service

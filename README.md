# 🎓 Learning Management System (LMS) – Backend

A scalable backend system for a **Learning Management System (LMS)** that connects instructors and students through structured online courses.  
This platform enables instructors to create and manage courses, upload lessons, track enrollments, and monetize content — while students can enroll, learn, track progress, and complete courses seamlessly.

---

## ✨ Core Features

### 🔐 Authentication & Role-Based Access
- Secure **JWT-based authentication**
- **Login**, **refresh token**, and **get logged-in user**
- Password change functionality
- Role-based access control:
  - **SUPER_ADMIN**
  - **ADMIN**
  - **INSTRUCTOR**
  - **STUDENT**

---

### 👤 User Management
- SUPER_ADMIN can create Admin accounts
- Public registration for:
  - Instructor
  - Student
- Avatar upload support
- Get all users (SUPER_ADMIN only)
- Soft delete users

---

### 📚 Course Management
- Instructors can:
  - Create courses
  - Upload course thumbnail
  - Update course details
  - Publish courses
  - Soft delete courses
  - View their own courses
- Public users can:
  - Browse all courses
  - View course details
- Authorized users can:
  - View lessons inside a course

---

### 🏷️ Category Management
- Admin can:
  - Create categories
  - Delete categories
- Used for organizing courses

---

### 🎥 Lesson Management
- Instructors can:
  - Create lessons
  - Upload lesson video
- Admin & Instructor can:
  - Delete lessons
- Admin, Instructor, Student can:
  - View lesson details

---

### 📖 Enrollment System
- Students can:
  - Enroll in courses
  - Pay for enrollments
  - Mark lessons as completed
  - View their enrolled courses
- Instructor & Admin can:
  - View enrollments by course

---

### 💳 Payment Processing
- Students can pay for enrollments
- Secure payment endpoint per enrollment

---

## 🧪 API Endpoints

Base URL: `/api/v1`

---

# 🔐 Auth Routes (`/api/v1/auth`)

| Method | Endpoint            | Description              | Access |
|--------|--------------------|--------------------------|--------|
| POST   | `/login`            | Login user               | Public |
| GET    | `/getme`            | Get logged-in user       | Public |
| POST   | `/refresh-token`    | Refresh access token     | Public |
| PATCH  | `/change-password`  | Change password          | Admin, Instructor, Student |

---

# 👤 User Routes (`/api/v1/user`)

| Method | Endpoint               | Description            | Access |
|--------|------------------------|------------------------|--------|
| POST   | `/create-admin`        | Create admin           | SUPER_ADMIN |
| POST   | `/create-instructor`   | Register instructor    | Public |
| POST   | `/create-student`      | Register student       | Public |
| GET    | `/`                    | Get all users          | SUPER_ADMIN |
| PATCH  | `/:id`                 | Soft delete user       | SUPER_ADMIN |

---

# 🏷️ Category Routes (`/api/v1/category`)

| Method | Endpoint  | Description        | Access |
|--------|-----------|-------------------|--------|
| POST   | `/`       | Create category    | Admin |
| DELETE | `/:id`    | Delete category    | Admin |

---

# 📚 Course Routes (`/api/v1/course`)

| Method | Endpoint                     | Description                          | Access |
|--------|------------------------------|--------------------------------------|--------|
| POST   | `/`                          | Create course                        | Instructor |
| PATCH  | `/:id`                       | Update course                        | Instructor |
| DELETE | `/:id`                       | Soft delete course                   | Instructor, Admin |
| PATCH  | `/:id/publish`               | Publish course                       | Instructor, Admin |
| GET    | `/`                          | Get all courses                      | Public |
| GET    | `/:id`                       | Get course by ID                     | Public |
| GET    | `/:id/lessons`               | List lessons by course               | Admin, Instructor, Student |
| GET    | `/instructor/courses`        | Get instructor’s courses             | Instructor |

---

# 🎥 Lesson Routes (`/api/v1/lesson`)

| Method | Endpoint   | Description          | Access |
|--------|------------|--------------------|--------|
| POST   | `/`        | Create lesson        | Instructor |
| DELETE | `/:id`     | Delete lesson        | Admin, Instructor |
| GET    | `/:id`     | Get lesson details   | Admin, Instructor, Student |

---

# 📖 Enrollment Routes (`/api/v1/enrollment`)

| Method | Endpoint                         | Description                        | Access |
|--------|----------------------------------|------------------------------------|--------|
| POST   | `/`                              | Enroll student                     | Student |
| POST   | `/:enrollmentId/payment`         | Pay for enrollment                 | Student |
| GET    | `/`                              | Get enrollments by course          | Instructor, Admin |
| PATCH  | `/mark-lesson-completed`         | Mark lesson as completed           | Student |
| GET    | `/student-courses`               | Get student enrolled courses       | Student |

---

## 🛠️ Tech Stack

- **TypeScript**
- **Node.js**
- **Express.js**
- **PostgreSQL** + **Prisma ORM**
- **JWT Authentication**
- **Bcrypt** password hashing
- **Zod** validation
- **Role-based authorization**
- **Multer** for file uploads (thumbnail, video, avatar)
- **Cloudinary** for media storage
- **Stripe** for payments

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/mustakim-rafid/Learning-management-system-backend.git
cd Learning-management-system-backend
```

### 2. Create `.env` file in the root directory

```env
PORT=
NODE_ENV=development

# Database
DATABASE_URL=database-url

# Cloudinary
CLOUDINARY_CLOUD_NAME=cloudinary-cloud-name
CLOUDINARY_API_KEY=cloudinary-api-key
CLOUDINARY_API_SECRET=cloudinary-api-secret

# bcrypt
BCRYPT_SALT_ROUND=

# JWT
ACCESS_TOKEN_SECRET=access-token-secret
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=refresh-token-secret
REFRESH_TOKEN_EXPIRY=

# Stripe

STRIPE_SECRET_KEY=stripe-secret-key
STRIPE_WEBHOOK_SECRET=stripe-webhook-secret

# Super admin

SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=

# Frontend url
FRONTEND_URL=frontend-url
```

### 3. Install dependencies and also configure prisma from documentation

```bash
npm install
```

### 4. Start the local server

```bash
npm run dev
```

### 6. Test with Postman or any API testing tool

---

## Thanks

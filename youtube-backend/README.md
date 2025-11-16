# 🎬 YouTube Backend API (Node.js + Express + MongoDB)

A complete YouTube-like backend API built using **Node.js**, **Express**, and **MongoDB (Mongoose)**.  
Includes user authentication, video metadata upload, comments, likes, subscriptions, search, history, & admin features.

---

## 📌 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Auth APIs](#auth-apis)
  - [User APIs](#user-apis)
  - [Video APIs](#video-apis)
  - [Like / Dislike APIs](#like--dislike-apis)
  - [Comment APIs](#comment-apis)
  - [Subscription APIs](#subscription-apis)
- [Database Models](#database-models)
- [Security](#security)
- [License](#license)

---

# 📘 About

This is the backend for a **YouTube-like platform**, providing:

- Users
- Channels
- Video Metadata
- Likes
- Comments
- Subscriptions
- Search
- History tracking
- Admin Controls

This backend does **not** store actual video files — it stores **video URLs** (Cloudinary / S3).

---

# 🔥 Features

- JWT-based Authentication
- User Registration, Login, Update
- Upload Video Metadata
- Likes / Dislikes
- Comments (Add/Delete)
- Subscribe / Unsubscribe
- Search by title, description, tags
- Trending Videos
- History Tracking
- Protected Routes
- Pagination on most endpoints

---

# 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB / Mongoose**
- **JWT Authentication**
- **bcrypt Password Hashing**
- **Cloudinary or S3 URL support**
- **Nodemon (dev)**

---

# 📂 Folder Structure

backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── server.js
├── package.json
└── .env

---

# ⚙️ Installation

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run dev

---

🔐 Environment Variables

Create .env:

PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

---

🎯 API Documentation

Base URL: http://localhost:5000/api/v1

🟦 AUTH APIs 
🟩 POST /api/v1/auth/register
🟩 POST /api/v1/auth/login

👤 USER APIs
🟦 GET /api/v1/users/:id
🟦 PUT /api/users/:id
🟩 POST /api/users/:id/subscribe
🟥 POST /api/users/:id/unsubscribe

🎥 VIDEO APIs
🟩 POST /api/videos (Protected)
🟦 GET /api/videos
🟦 GET /api/videos/:id
🟧 PUT /api/videos/:id
🟥 DELETE /api/videos/:id

👍 LIKE / DISLIKE APIs
🟩 POST /api/videos/:id/like
🟩 POST /api/videos/:id/dislike

💬 COMMENT APIs
🟩 POST /api/videos/:videoId/comments
🟦 GET /api/videos/:videoId/comments
🟥 DELETE /api/comments/:commentId

🔔 SUBSCRIPTION APIs
POST /api/users/:id/subscribe
POST /api/users/:id/unsubscribe

---

🔐 Security

Password hashing using bcrypt

JWT tokens

Rate limiting recommended

Escape MongoDB queries

Do not store video files in DB

---

Required:

Set environment variables

Use MongoDB Atlas

---

📄 License

MIT License

---

📬 Contact

Developer: Devesh Kumar
Email: deveshmuz2020@gmail.com

GitHub: https://github.com/Devesh-shah24
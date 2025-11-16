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
  - [Search & Explore APIs](#search--explore-apis)
- [Database Models](#database-models)
- [Security](#security)
- [Deployment](#deployment)
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


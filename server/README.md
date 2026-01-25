# IVO Backend Setup Guide

Welcome to the backend of the IVO Professional Network! This server handles authentication, profile management, job postings, and the AI Assistant.

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (Version 16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local installed or MongoDB Atlas cloud URI)
- A Google Gemini API Key (Get it [here](https://aistudio.google.com/))

### 2. Installation
Navigate to this folder and install dependencies:
```bash
npm install
```

### 3. Configuration
Copy the `.env` template values (already created for you in this directory) and ensure they are correct:
- `MONGO_URI`: Your MongoDB connection string.
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `JWT_SECRET`: Any secret string (e.g., `my_secret_ivo_key`).

### 4. Seed the Database (Optional but Recommended)
To start with some sample professionals and jobs, run:
```bash
npm run seed
```
*Note: This will clear the database and add sample data.*

### 5. Start the Server
```bash
npm run dev
```

---

## 🛠 Features
- **Auth**: `/api/auth/signup` and `/api/auth/login`
- **Profile**: `/api/profile/me` and `/api/professionals`
- **Jobs**: `/api/jobs`
- **AI Agent**: `/api/ai/chat` (Connected to Gemini Pro)

## 📁 Folder Structure
- `/models`: Database schemas.
- `/routes`: API endpoints.
- `/middleware`: Authentication & security.
- `/uploads`: Storage for profile avatars.

Happy Coding! 🚀

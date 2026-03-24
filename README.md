# 🌐 Mini Social Post App

A full-stack social media feed application built as part of the **3W Full Stack Internship Assignment**.

## 🚀 Features

- 🔐 User Signup & Login (JWT Authentication)
- 📝 Create posts with text, image, or both
- 📰 Public feed showing all posts
- ❤️ Like / Unlike posts
- 💬 Comment on posts
- 👤 User avatars with initials
- 📱 Responsive design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + React Bootstrap |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Multer |

## 📁 Project Structure

```
Mini_Social_Post_app/
├── frontend/         # React.js app
│   └── src/
│       ├── components/   # Navbar, PostCard, CreatePost
│       ├── pages/        # Login, Signup, Feed
│       └── context/      # AuthContext
└── backend/          # Node.js + Express API
    ├── models/       # User, Post schemas
    ├── routes/       # auth, posts
    ├── middleware/   # JWT auth middleware
    └── uploads/      # Uploaded images
```

## ⚙️ Setup & Run Locally

### Backend
```bash
cd backend
cp .env.example .env   # Fill in MONGO_URI and JWT_SECRET
npm install
npm run dev            # Runs on http://localhost:5001
```

### Frontend
```bash
cd frontend
npm install
npm start              # Runs on http://localhost:3000
```

## 🌍 Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📬 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/posts` | No | Get all posts |
| POST | `/api/posts` | Yes | Create post |
| PUT | `/api/posts/:id/like` | Yes | Toggle like |
| POST | `/api/posts/:id/comment` | Yes | Add comment |

# ConnectHub

ConnectHub is a full-stack social media web application where users can create posts, interact with other users, and build connections through likes, comments, and follow functionality.

## 🚀 Features

- 🔐 User Registration & Login
- 🔑 JWT Authentication & Authorization
- 📝 Create Posts
- ✏️ Edit Your Posts
- 🗑️ Delete Your Posts
- ❤️ Like / Unlike Posts
- 💬 Add & Delete Comments
- 👤 User Profiles
- ✏️ Edit Profile
- 🖼️ Profile Image URL
- 🔍 Search Users
- 👥 Follow / Unfollow Users
- 📊 Followers & Following Counts
- 📰 Personalized Following Feed
- 📱 Responsive UI

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- JWT Authentication

### Database

- MongoDB
- Mongoose

## 📁 Project Structure

```text
ConnectHub/
│
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── css/
    │   └── style.css
    │
    ├── js/
    │   ├── feed.js
    │   |── profile.js
    |   |__ auth.js
    |   |__ api.js
    │
    ├── index.html
    ├── login.html
    └── profile.html
    |__ register.html
|
|____ Readme.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ConnectHub.git
```

### 2. Open the project

```bash
cd ConnectHub
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Create .env

Create a .env file inside the backend folder:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 5. Start the backend

```bash
npm run dev
```

The backend will run on:

```bash
http://localhost:5000
```

### 6. Run the frontend

Open the frontend/index.html file using VS Code Live Server.

## 🎯 Future Improvements

🔔 Notifications
📸 Real image uploads using Cloudinary
💬 Real-time messaging
🌙 Dark mode
❤️ Post reaction system
🔔 Real-time notifications
🚀 Deployment with MongoDB Atlas & Render

## 👨‍💻 Author

Lovesh Semwal

B.Tech Computer Science & Engineering Student

# 📝 Blogger Platform

A modern, full-stack social blogging platform built with the MERN stack. Write, share, and discover content with a beautiful, minimalistic interface.


## ✨Features

### Core Functionality
- **Rich Post Editor** - Create posts with titles, content, excerpts, tags, and featured images
- **Draft System** - Save and publish posts at your own pace
- **Social Engagement** - Like posts and comments, follow writers
- **Comments** - Engage in discussions with nested replies
- **Personalized Feed** - See posts from writers you follow
- **Trending Content** - Discover popular posts and new writers

### User Experience
- **Dark/Light Mode** - Seamless theme switching with persistence
- **Fully Responsive** - Beautiful on mobile, tablet, and desktop
- **Smooth Animations** - Micro-interactions throughout
- **Fast Performance** - Optimized loading and instant feedback
- **Minimalistic Design** - Clean, distraction-free reading

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library (JavaScript, no TypeScript)
- **React Router** - Client-side routing
- **TailwindCSS v4** - Utility-first CSS framework
- **Axios** - HTTP client
- **Vite** - Fast build tool

### Backend
- **Node.js & Express** - REST API server
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📢 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Divii2205/Blogger.git
cd Blogger
```

2. **Setup Backend**
```bash
cd Blogger_Backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/blogger_platform
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development" > .env

# Start backend
npm run dev
```

3. **Setup Frontend**
```bash
cd ../Blogger_Frontend
npm install

# Start frontend
npm run dev
```

4. **Open your browser**
```
http://localhost:3000
```

## 📦 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://localhost:5000/api
```

## ⚙ Project Structure

```
Blogger/
├── Blogger_Backend/          # Express API server
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Auth & validation
│   └── server.js            # Entry point
│
├── Blogger_Frontend/        # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Auth & Theme contexts
│   │   ├── pages/          # Page components
│   │   └── utils/          # API client & helpers
│   └── index.html
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile (protected)
- `PUT /api/users/avatar` - Update avatar (protected)
- `PUT /api/users/preferences` - Update preferences (protected)

### Social Features
- `POST /api/follows/:userId` - Follow/unfollow user
- `POST /api/likes/post/:postId` - Like/unlike post
- `POST /api/comments` - Create comment
- `GET /api/comments/post/:postId` - Get post comments

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth with 7-day expiry
- **Password Hashing** - bcrypt with 12 salt rounds
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Helmet** - Security headers
- **CORS** - Configured cross-origin policies
- **Input Validation** - express-validator for sanitization
- **MongoDB Injection Protection** - Mongoose schema validation

## 🎨 Design System

- **Colors**: Soft neutral palette with blue accents
- **Typography**: Inter (UI) & Merriweather (content)
- **Animations**: Fade-in, slide-up, scale-in transitions
- **Dark Mode**: System preference detection + manual toggle
- **Responsive**: Breakpoints at 768px and 1024px

## 📃 Pages

1. **Home** - Latest posts from all users
2. **Feed** - Personalized feed (requires login)
3. **Explore** - Trending posts and discover writers
4. **Post View** - Read posts with comments
5. **Editor** - Create and edit posts
6. **Profile** - User profiles with posts
7. **Settings** - Account settings and preferences
8. **Login/Register** - Authentication pages

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set root directory to `Blogger_Frontend`
3. Add environment variable: `VITE_API_URL`
4. Deploy!

### Backend (Render)
1. Connect GitHub repository
2. Set root directory to `Blogger_Backend`
3. Add environment variables (MongoDB URI, JWT secret, etc.)
4. Deploy!

## 🔗 Live Demo

- **Frontend**: [https://blogger-tau-five.vercel.app](https://blogger-tau-five.vercel.app)
- **Backend API**: [https://blogger-l1tj.onrender.com](https://blogger-l1tj.onrender.com)

## 📄 License

- ISC License
- Built using React, Node.js, and MongoDB



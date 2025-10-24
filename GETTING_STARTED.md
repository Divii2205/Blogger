# Getting Started with Blogger Platform

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Step 1: Setup Backend

```bash
# Navigate to backend directory
cd Blogger_Backend

# Install dependencies (if not already installed)
npm install

# Create .env file
# Add these variables:
MONGODB_URI=mongodb://localhost:27017/blogger_platform
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development

# Start backend server
npm start
```

Backend will run on `http://localhost:5000`

### Step 2: Setup Frontend

```bash
# Navigate to frontend directory (new terminal)
cd Blogger_Frontend

# Dependencies are already installed

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### Step 3: Open Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📝 First Steps

### 1. Register an Account
- Click "Sign up" in the navbar
- Fill in your details:
  - Full Name
  - Username (letters, numbers, underscores only)
  - Email
  - Password (min 6 characters)
- Click "Create Account"

### 2. Explore the Platform
- Browse posts on the home page
- Toggle dark/light mode with the sun/moon icon
- Click "Explore" to see trending posts

### 3. Write Your First Post
- Click "Write" in the navbar
- Add a title and content
- Optionally add:
  - Featured image URL
  - Tags (comma-separated)
  - Excerpt
- Click "Publish" or "Save as Draft"

### 4. Interact with Content
- ❤️ Like posts
- 💬 Comment on posts
- 👤 Follow other writers
- 📰 Check your personalized feed

## 🎨 Features Overview

### For All Users
- ✅ Browse all published posts
- ✅ View trending content
- ✅ Search for writers
- ✅ Read posts with comments
- ✅ View user profiles
- ✅ Dark/Light mode

### For Registered Users
- ✅ Create, edit, and delete posts
- ✅ Like and comment on posts
- ✅ Follow/unfollow writers
- ✅ Personalized feed
- ✅ Profile customization
- ✅ Avatar management
- ✅ Draft posts

## 📱 Pages Guide

| Page | URL | Description | Auth Required |
|------|-----|-------------|---------------|
| Home | `/` | Latest posts from everyone | No |
| Feed | `/feed` | Posts from followed users | Yes |
| Explore | `/explore` | Trending posts + discover writers | No |
| Post | `/post/:id` | Read single post | No |
| Write | `/write` | Create/edit posts | Yes |
| Profile | `/profile/:username` | User profile | No |
| Settings | `/settings` | Account settings | Yes |
| Login | `/login` | Sign in | No |
| Register | `/register` | Create account | No |

## 🎯 Usage Tips

### Writing Great Posts
1. Use engaging titles
2. Add featured images for visual appeal
3. Use relevant tags for discoverability
4. Write clear, concise excerpts
5. Format content for readability

### Growing Your Audience
1. Follow other writers you enjoy
2. Engage with comments
3. Like quality content
4. Post consistently
5. Use trending tags

### Customizing Your Profile
1. Go to Settings → Profile
2. Add a bio (max 500 characters)
3. Add your location and website
4. Update your avatar URL
5. Set your theme preference

## 🎨 Design Features

### Color Themes
- **Light Mode**: Clean white background with neutral grays
- **Dark Mode**: Rich dark background with blue accents

### Animations
- Smooth page transitions
- Micro-interactions on buttons
- Hover effects on cards
- Loading states

### Typography
- **UI**: Inter font family (clean and modern)
- **Content**: Merriweather (readable serif for articles)

## 🔧 Troubleshooting

### Backend Issues
**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**Port 5000 in use**
- Change PORT in .env
- Update VITE_API_URL in frontend .env

### Frontend Issues
**Port 3000 in use**
- Vite will auto-select next available port
- Check terminal output for actual port

**API Connection Failed**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify .env file exists in Blogger_Frontend

**Theme not working**
- Clear browser localStorage
- Hard refresh (Ctrl+Shift+R)

### Common Issues
**Can't login after registration**
- Check backend logs for errors
- Verify MongoDB is saving users
- Try different email/username

**Posts not showing**
- Check post status (must be "published")
- Verify backend API is responding
- Check browser network tab

## 📦 Tech Stack

### Frontend
- React 19.2.0 (JavaScript)
- React Router 7.9.4
- TailwindCSS 4.1.16
- Axios 1.12.2
- Vite 7.1.12

### Backend
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for passwords

## 🚀 Production Deployment

### Backend
1. Set environment variables on hosting platform
2. Use production MongoDB URI
3. Set NODE_ENV=production
4. Deploy to Heroku, Railway, or Render

### Frontend
1. Build: `npm run build`
2. Deploy `dist` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
3. Update VITE_API_URL to production backend URL

## 📚 API Documentation

Backend exposes REST API at `/api`:
- `/api/auth` - Authentication
- `/api/posts` - Posts CRUD
- `/api/users` - User profiles
- `/api/comments` - Comments
- `/api/likes` - Likes
- `/api/follows` - Follow system

See backend code for detailed endpoints.

## 🎓 Learning Resources

### React
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)

### TailwindCSS
- [Tailwind Docs](https://tailwindcss.com)
- [Tailwind UI](https://tailwindui.com)

### Backend
- [Express.js](https://expressjs.com)
- [MongoDB](https://www.mongodb.com/docs)

## 💡 Development Tips

1. Keep backend and frontend terminals open
2. Use browser DevTools for debugging
3. Check browser console for errors
4. Use React DevTools extension
5. Monitor MongoDB with Compass

## 🎉 You're All Set!

Start creating amazing content and building your blogging community!

For more details, see:
- `Blogger_Frontend/README.md` - Frontend documentation
- `Blogger_Frontend/SETUP.md` - Detailed setup
- `Blogger_Frontend/PROJECT_SUMMARY.md` - Complete feature list
- `Blogger_Backend/README.md` - Backend documentation

Happy Blogging! ✍️📚✨


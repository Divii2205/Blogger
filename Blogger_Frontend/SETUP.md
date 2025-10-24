# Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Backend Server
Make sure your backend server is running on port 5000:
```bash
cd ../Blogger_Backend
npm start
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Credentials (After Registration)

You'll need to register a new account. No default credentials are provided.

## Features Checklist

✅ User Authentication (Login/Register)
✅ Dark/Light Mode Toggle
✅ Create, Edit, Delete Posts
✅ Like Posts
✅ Comment on Posts
✅ Follow/Unfollow Users
✅ User Profiles
✅ Explore Trending Posts
✅ Personalized Feed
✅ Settings Page
✅ Responsive Design
✅ Smooth Animations

## Pages

- `/` - Home page with latest posts
- `/feed` - Personalized feed (requires login)
- `/explore` - Explore trending posts and writers
- `/post/:id` - View single post with comments
- `/write` - Create new post (requires login)
- `/profile/:username` - User profile
- `/settings` - Account settings (requires login)
- `/login` - Login page
- `/register` - Registration page

## Tips

1. **Dark Mode**: Click the sun/moon icon in the navbar
2. **Write Posts**: Click "Write" button in navbar (requires login)
3. **Follow Users**: Visit profiles and click "Follow"
4. **Like Posts**: Click the heart icon on any post
5. **Comment**: View any post and add comments (requires login)

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically use the next available port.

### Backend Connection Issues
Make sure:
- Backend server is running on port 5000
- CORS is properly configured in backend
- `.env` file has correct API URL

### Theme Not Persisting
- Clear browser localStorage
- Check browser console for errors

## Development

### Project Structure
```
src/
├── components/       # Reusable components
│   ├── layout/      # Layout components
│   ├── ui/          # UI components
│   ├── PostCard.jsx # Post card component
│   └── ProtectedRoute.jsx
├── contexts/        # React contexts
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/           # Page components
│   ├── Home.jsx
│   ├── Feed.jsx
│   ├── Explore.jsx
│   ├── PostView.jsx
│   ├── Editor.jsx
│   ├── Profile.jsx
│   ├── Settings.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── utils/           # Utilities
│   └── api.js      # API client
├── App.jsx         # Main app
├── main.jsx        # Entry point
└── index.css       # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Design Philosophy

- **Minimalistic**: Clean and simple interface
- **Aesthetic**: Soft colors, rounded corners, subtle shadows
- **Readable**: Focus on content with great typography
- **Smooth**: Micro animations for better UX
- **Responsive**: Works on all screen sizes

Enjoy blogging! 📝✨


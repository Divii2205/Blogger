# Blogger Frontend - Project Summary

## Overview

A beautiful, minimalistic blogging platform built with **React (JavaScript)** and **TailwindCSS**. Features a clean, elegant UI with dark/light mode support, smooth animations, and full responsiveness.

## Tech Stack

- **React 19.2.0** (JavaScript - NO TypeScript)
- **React Router 7.9.4** - Client-side routing
- **TailwindCSS 4.1.16** - Styling
- **Axios 1.12.2** - HTTP client
- **Vite 7.1.12** - Build tool & dev server

## Features Implemented

### Authentication & Authorization
- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Protected routes for authenticated users
- ✅ Persistent authentication (localStorage)
- ✅ Auto token refresh

### User Interface
- ✅ **Dark/Light Mode** - Persistent theme switching
- ✅ **Responsive Design** - Mobile, tablet, and desktop
- ✅ **Smooth Animations** - Fade-in, slide-up, scale-in effects
- ✅ **Modern UI Components** - Buttons, inputs, cards, modals, badges
- ✅ **Clean Typography** - Inter for UI, Merriweather for content
- ✅ **Soft Color Palette** - Neutral grays with blue accents

### Core Features

#### Posts
- ✅ Create posts with title, content, excerpt, tags, featured image
- ✅ Edit your own posts
- ✅ Delete your own posts
- ✅ Draft and publish status
- ✅ Auto-generated reading time
- ✅ Auto-generated excerpt
- ✅ View count tracking

#### Social Features
- ✅ Like/unlike posts (with optimistic updates)
- ✅ Comment on posts
- ✅ Follow/unfollow users
- ✅ View followers/following lists
- ✅ Personalized feed from followed users
- ✅ Discover trending posts
- ✅ Search for users

#### User Profiles
- ✅ View user profiles with bio, location, website
- ✅ Display user's posts, followers, following count
- ✅ Edit your own profile
- ✅ Update avatar
- ✅ View published and draft posts (own profile)

#### Settings
- ✅ Update profile information
- ✅ Change avatar
- ✅ Toggle theme preference
- ✅ Manage notification preferences

### Pages Implemented

1. **Home (`/`)** - Latest posts from all users with sorting options
2. **Feed (`/feed`)** - Personalized feed from followed users (protected)
3. **Explore (`/explore`)** - Trending posts + discover writers
4. **Post View (`/post/:id`)** - Single post with comments
5. **Editor (`/write`)** - Create/edit posts (protected)
6. **Profile (`/profile/:username`)** - User profile and posts
7. **Settings (`/settings`)** - Account settings (protected)
8. **Login (`/login`)** - Authentication
9. **Register (`/register`)** - User registration

## Component Architecture

### UI Components (`src/components/ui/`)
- `Button.jsx` - Multiple variants and sizes
- `Input.jsx` - Form input with labels, errors, icons
- `Textarea.jsx` - Multi-line text input
- `Card.jsx` - Container with hover effects
- `Avatar.jsx` - User avatars with fallback initials
- `Modal.jsx` - Overlay dialogs
- `Badge.jsx` - Tag labels with variants

### Layout Components (`src/components/layout/`)
- `Navbar.jsx` - Responsive navigation with mobile menu
- `Layout.jsx` - Page wrapper

### Feature Components (`src/components/`)
- `PostCard.jsx` - Post preview card with like/comment counts
- `ProtectedRoute.jsx` - Route guard for authentication

### Context Providers (`src/contexts/`)
- `AuthContext.jsx` - Authentication state management
- `ThemeContext.jsx` - Theme (dark/light) state management

### API Client (`src/utils/`)
- `api.js` - Axios instance with interceptors and API functions

## Design System

### Colors
```
Primary: Blue (#0ea5e9, #0284c7, #0369a1)
Neutral: Grayscale (#fafafa to #0a0a0a)
Success: Green
Warning: Yellow
Danger: Red
```

### Typography
- **UI Font**: Inter (sans-serif) - 300, 400, 500, 600, 700
- **Content Font**: Merriweather (serif) - 300, 400, 700

### Spacing & Sizing
- Consistent padding: 4, 6, 8 (tailwind scale)
- Border radius: lg, xl, 2xl for rounded corners
- Shadows: sm, md, lg for depth

### Animations
- Fade-in: 0.3s ease-in-out
- Slide-up: 0.3s ease-out
- Scale-in: 0.2s ease-out
- Transition-all: 200ms for smooth interactions

## API Integration

### Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/posts` - Get all posts
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/likes/post/:postId` - Like/unlike post
- `POST /api/follows/:userId` - Follow/unfollow user
- `GET /api/comments/post/:postId` - Get comments
- `POST /api/comments` - Create comment
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/avatar` - Update avatar
- `PUT /api/users/preferences` - Update preferences

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Lazy loading with React Router
- Optimistic UI updates (likes, follows)
- Debounced search
- Image optimization
- Code splitting
- Minimal re-renders with proper state management

## Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- High contrast ratios for text

## Future Enhancements (Optional)

- Rich text editor (Markdown/WYSIWYG)
- Image upload to cloud storage
- Bookmarking posts
- Search functionality for posts
- Notifications system
- Email verification
- Password reset
- Post categories
- Reading lists
- Social sharing

## Development Guidelines

1. **No TypeScript** - Pure JavaScript only
2. **Functional Components** - Use hooks, no class components
3. **TailwindCSS** - Utility classes, no custom CSS files
4. **Component Composition** - Reusable, modular components
5. **Context for State** - Auth and Theme contexts
6. **Clean Code** - Clear naming, comments where needed

## File Structure Summary

```
Blogger_Frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Badge.jsx
│   │   ├── PostCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Feed.jsx
│   │   ├── Explore.jsx
│   │   ├── PostView.jsx
│   │   ├── Editor.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── README.md
└── SETUP.md
```

## Ready to Deploy! 🚀

The frontend is complete and production-ready. Follow the SETUP.md instructions to get started!


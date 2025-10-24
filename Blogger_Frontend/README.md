# Blogger Frontend

A minimalistic and elegant blogging platform built with React and TailwindCSS.

## Features

- 🎨 Beautiful, minimalistic UI with dark/light mode
- 📝 Rich post editor with featured images and tags
- 👤 User profiles with followers/following
- ❤️ Like and comment on posts
- 🔍 Explore trending posts and discover writers
- 📱 Fully responsive design
- ⚡ Fast and smooth animations

## Tech Stack

- **React** - UI library
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see Blogger_Backend)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── layout/       # Layout components (Navbar, etc.)
│   └── ui/           # UI components (Button, Input, etc.)
├── contexts/         # React contexts (Auth, Theme)
├── pages/            # Page components
├── utils/            # Utility functions and API
├── App.jsx           # Main app component
├── main.jsx          # App entry point
└── index.css         # Global styles
```

## Pages

- **Home** - Latest posts from all users
- **Feed** - Personalized feed from followed users
- **Explore** - Trending posts and discover writers
- **Post View** - Read posts with comments
- **Editor** - Write and edit posts
- **Profile** - User profile and posts
- **Settings** - Account settings and preferences
- **Login/Register** - Authentication

## Color Scheme

The app uses a neutral color palette for a clean, minimalistic look:
- Primary: Blue (customizable in tailwind.config.js)
- Neutral: Grayscale for backgrounds and text
- Supports both light and dark modes

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC


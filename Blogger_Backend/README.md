# Blogger Platform - Backend

A modern, full-stack social blogging platform built with Node.js, Express, MongoDB, and React.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Blog Posts**: Create, read, update, and delete blog posts
- **Social Features**: Follow users, like posts, comment on posts
- **User Profiles**: Customizable user profiles with bio, avatar, and preferences
- **Feed System**: Personalized feed based on followed users
- **Trending Content**: Discover trending posts and popular content
- **Responsive Design**: Mobile-first responsive design
- **Dark/Light Mode**: Theme switching support

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Rate Limiting** - API rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blogger-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/blogger_platform
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env` file

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:username` - Get user by username
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/avatar` - Update user avatar
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/:username/followers` - Get user's followers
- `GET /api/users/:username/following` - Get users that user is following

### Posts
- `GET /api/posts` - Get all published posts
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `GET /api/posts/user/:username` - Get posts by username

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create a new comment
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment
- `POST /api/comments/:id/like` - Like/unlike a comment
- `GET /api/comments/:id` - Get single comment with replies

### Likes
- `POST /api/likes/post/:postId` - Like/unlike a post
- `GET /api/likes/post/:postId/users` - Get users who liked a post
- `GET /api/likes/user/:userId/posts` - Get posts liked by a user
- `GET /api/likes/user/:userId/count` - Get like count for user's posts
- `POST /api/likes/comment/:commentId` - Like/unlike a comment

### Follows
- `POST /api/follows/:userId` - Follow/unfollow a user
- `GET /api/follows/:userId/status` - Check follow status
- `GET /api/follows/:userId/followers` - Get user's followers
- `GET /api/follows/:userId/following` - Get users that user is following
- `GET /api/follows/suggestions` - Get suggested users to follow
- `GET /api/follows/mutual/:userId` - Get mutual followers

## Database Schema

### User Model
- username (unique)
- email (unique)
- password (hashed)
- fullName
- bio
- avatar
- website
- location
- followers/following arrays
- preferences (theme, notifications)

### Post Model
- title
- content
- author (User reference)
- tags
- featuredImage
- status (draft/published/archived)
- likes array
- commentsCount
- views
- readingTime

### Comment Model
- content
- author (User reference)
- post (Post reference)
- parentComment (for replies)
- likes array
- isEdited
- isDeleted (soft delete)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting
- CORS protection
- Helmet security headers
- Password strength requirements

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Project Structure
```
blogger-backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const requestContext = require('./middleware/requestContext');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess, sendError } = require('./utils/apiResponse');
const validateEnv = require('./utils/validateEnv');
require('dotenv').config();
validateEnv();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(requestContext);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'https://blogger-tau-five.vercel.app',
  process.env.CLIENT_URL,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      if ((process.env.NODE_ENV || 'development') === 'development') {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked for this origin'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// `useNewUrlParser` / `useUnifiedTopology` are deprecated no-ops in
// Mongoose >=6 and were spamming warnings on every boot.
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/blogger_platform';

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/upload', require('./routes/upload'));

// Root route - API welcome page
app.get('/', (req, res) => {
  return sendSuccess(res, {
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth (register, login)',
      posts: '/api/posts',
      users: '/api/users',
      comments: '/api/comments',
      likes: '/api/likes',
      follows: '/api/follows'
    },
    documentation: 'See README.md for full API documentation',
    status: 'Running'
  }, 'Blogger Platform API');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  }, 'Blogger Platform API is running');
});

app.get('/api/ready', (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return sendError(res, 'Database not ready', 503);
  }
  return sendSuccess(res, { ready: true }, 'Service ready');
});

// 404 handler
app.use('*', (req, res) => {
  return sendError(res, 'Route not found', 404);
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Don't accept traffic until Mongo is connected. The previous version
// listened immediately and just logged a connection error, so requests
// arriving during a Mongo outage would hang on the first model query.
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

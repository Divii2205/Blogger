const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all published posts with pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'publishedAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const tag = req.query.tag;
    const author = req.query.author;

    let query = { status: 'published' };

    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    if (author) {
      const authorUser = await User.findOne({ username: author });
      if (authorUser) {
        query.author = authorUser._id;
      }
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/trending
// @desc    Get trending posts
// @access  Public
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const timeframe = req.query.timeframe || '7'; // days

    const date = new Date();
    date.setDate(date.getDate() - parseInt(timeframe));

    const posts = await Post.find({
      status: 'published',
      publishedAt: { $gte: date }
    })
    .populate('author', 'username fullName avatar')
    .sort({ 
      likesCount: -1,
      views: -1,
      publishedAt: -1 
    })
    .limit(limit);

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }

    res.json({
      success: true,
      data: {
        posts
      }
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/feed
// @desc    Get personalized feed for authenticated user
// @access  Private
router.get('/feed', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts from users that the current user follows
    const user = await User.findById(req.user._id).select('following');
    const followingIds = user.following;

    // If user doesn't follow anyone, show trending posts
    if (followingIds.length === 0) {
      const posts = await Post.find({ status: 'published' })
        .populate('author', 'username fullName avatar')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        success: true,
        data: {
          posts,
          pagination: {
            page,
            limit,
            total: await Post.countDocuments({ status: 'published' }),
            pages: Math.ceil(await Post.countDocuments({ status: 'published' }) / limit)
          }
        }
      });
    }

    const posts = await Post.find({
      author: { $in: followingIds },
      status: 'published'
    })
    .populate('author', 'username fullName avatar')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Post.countDocuments({
      author: { $in: followingIds },
      status: 'published'
    });

    // Add like status
    posts.forEach(post => {
      post.isLiked = post.isLikedBy(req.user._id);
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatar bio followersCount');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    await post.incrementViews();

    // Add like status for authenticated users
    if (req.user) {
      post.isLiked = post.isLikedBy(req.user._id);
    }

    res.json({
      success: true,
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 50000 })
    .withMessage('Content cannot exceed 50,000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, tags = [], status = 'draft', featuredImage, excerpt } = req.body;

    const post = new Post({
      title,
      content,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      author: req.user._id,
      status,
      featuredImage,
      excerpt,
      publishedAt: status === 'published' ? new Date() : null
    });

    await post.save();
    await post.populate('author', 'username fullName avatar');

    // Update user's post count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { postsCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (owner only)
router.put('/:id', protect, [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Content cannot exceed 50,000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { title, content, tags, status, featuredImage, excerpt } = req.body;

    // Update fields
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags.map(tag => tag.toLowerCase().trim());
    if (status !== undefined) post.status = status;
    if (featuredImage !== undefined) post.featuredImage = featuredImage;
    if (excerpt !== undefined) post.excerpt = excerpt;

    // Set published date if status changed to published
    if (status === 'published' && post.status !== 'published') {
      post.publishedAt = new Date();
    }

    await post.save();
    await post.populate('author', 'username fullName avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    // Update user's post count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { postsCount: -1 }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/user/:username
// @desc    Get posts by username
// @access  Public
router.get('/user/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'published';

    let query = { author: user._id };
    if (status !== 'all') {
      query.status = status;
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.isLikedBy(req.user._id);
      });
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

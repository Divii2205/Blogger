const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/likes/post/:postId
// @desc    Like/unlike a post
// @access  Private
router.post('/post/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot like unpublished post'
      });
    }

    const isLiked = post.isLikedBy(req.user._id);

    if (isLiked) {
      await post.removeLike(req.user._id);
      // Remove from user's liked posts
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { likedPosts: post._id }
      });
    } else {
      await post.addLike(req.user._id);
      // Add to user's liked posts
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { likedPosts: post._id }
      });
    }

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      data: {
        isLiked: !isLiked,
        likesCount: post.likesCount
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/likes/post/:postId/users
// @desc    Get users who liked a post
// @access  Public
router.get('/post/:postId/users', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('likes.user', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const users = post.likes.map(like => like.user);

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/likes/user/:userId/posts
// @desc    Get posts liked by a user
// @access  Public
router.get('/user/:userId/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const posts = await Post.find({
      _id: { $in: user.likedPosts },
      status: 'published'
    })
    .populate('author', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Post.countDocuments({
      _id: { $in: user.likedPosts },
      status: 'published'
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
    console.error('Get user liked posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/likes/user/:userId/count
// @desc    Get like count for user's posts
// @access  Public
router.get('/user/:userId/count', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get total likes received by user's posts
    const result = await Post.aggregate([
      { $match: { author: user._id, status: 'published' } },
      { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
    ]);

    const totalLikes = result.length > 0 ? result[0].totalLikes : 0;

    res.json({
      success: true,
      data: {
        totalLikes
      }
    });
  } catch (error) {
    console.error('Get user like count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/likes/comment/:commentId
// @desc    Like/unlike a comment
// @access  Private
router.post('/comment/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot like deleted comment'
      });
    }

    const isLiked = comment.isLikedBy(req.user._id);

    if (isLiked) {
      await comment.removeLike(req.user._id);
    } else {
      await comment.addLike(req.user._id);
    }

    res.json({
      success: true,
      message: isLiked ? 'Comment unliked' : 'Comment liked',
      data: {
        isLiked: !isLiked,
        likesCount: comment.likesCount
      }
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/likes/comment/:commentId/users
// @desc    Get users who liked a comment
// @access  Public
router.get('/comment/:commentId/users', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate('likes.user', 'username fullName avatar');

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const users = comment.likes.map(like => like.user);

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get comment likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

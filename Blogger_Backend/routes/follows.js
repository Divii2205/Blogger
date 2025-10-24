const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/follows/:userId
// @desc    Follow/unfollow a user
// @access  Private
router.post('/:userId', protect, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Can't follow yourself
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId }
      });
      
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId }
      });

      // Update follow counts
      await currentUser.updateFollowCounts();
      await targetUser.updateFollowCounts();

      res.json({
        success: true,
        message: 'User unfollowed successfully',
        data: {
          isFollowing: false,
          followersCount: targetUser.followersCount - 1,
          followingCount: currentUser.followingCount - 1
        }
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId }
      });
      
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId }
      });

      // Update follow counts
      await currentUser.updateFollowCounts();
      await targetUser.updateFollowCounts();

      res.json({
        success: true,
        message: 'User followed successfully',
        data: {
          isFollowing: true,
          followersCount: targetUser.followersCount + 1,
          followingCount: currentUser.followingCount + 1
        }
      });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/follows/:userId/status
// @desc    Check if current user follows target user
// @access  Private
router.get('/:userId/status', protect, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(targetUserId);

    res.json({
      success: true,
      data: {
        isFollowing
      }
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/follows/:userId/followers
// @desc    Get user's followers
// @access  Public
router.get('/:userId/followers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'followers',
        select: 'username fullName avatar bio followersCount followingCount',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = await User.countDocuments({ following: req.params.userId });

    res.json({
      success: true,
      data: {
        followers: user.followers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/follows/:userId/following
// @desc    Get users that user is following
// @access  Public
router.get('/:userId/following', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'following',
        select: 'username fullName avatar bio followersCount followingCount',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = await User.countDocuments({ followers: req.params.userId });

    res.json({
      success: true,
      data: {
        following: user.following,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/follows/suggestions
// @desc    Get suggested users to follow
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const currentUserId = req.user._id;

    // Get users that current user doesn't follow and is not the current user
    const suggestions = await User.find({
      _id: { $nin: [...req.user.following, currentUserId] },
      followersCount: { $gte: 1 } // Only suggest users with some followers
    })
    .select('username fullName avatar bio followersCount followingCount')
    .sort({ followersCount: -1, createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    console.error('Get follow suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/follows/mutual/:userId
// @desc    Get mutual followers between current user and target user
// @access  Private
router.get('/mutual/:userId', protect, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find mutual followers
    const mutualFollowers = await User.find({
      _id: { $in: currentUser.followers },
      followers: targetUserId
    })
    .select('username fullName avatar bio followersCount followingCount')
    .limit(10);

    res.json({
      success: true,
      data: {
        mutualFollowers
      }
    });
  } catch (error) {
    console.error('Get mutual followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

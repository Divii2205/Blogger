const AppError = require("../utils/appError");
const { parsePagination } = require("../utils/query");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const likeRepository = require("../repositories/likeRepository");

const togglePostLike = async (authUser, postId) => {
  const post = await Post.findById(postId).select("status");
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (post.status !== "published") {
    throw new AppError("Cannot like unpublished post", 400);
  }

  const wasLiked = await likeRepository.isPostLikedBy(postId, authUser._id);

  if (wasLiked) {
    await likeRepository.removePostLike(postId, authUser._id);
    await likeRepository.removePostFromUserLiked(authUser._id, postId);
  } else {
    await likeRepository.addPostLike(postId, authUser._id);
    await likeRepository.addPostToUserLiked(authUser._id, postId);
  }

  const fresh = await likeRepository.getPostLikesCount(postId);

  return {
    isLiked: !wasLiked,
    likesCount: fresh.likesCount,
  };
};

const getPostLikers = async (postId) => {
  const post = await likeRepository.findPostLikers(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  return { users: post.likes.map((like) => like.user) };
};

const getUserLikedPosts = async (userId, queryParams) => {
  const { page, limit, skip } = parsePagination(queryParams);

  const user = await User.findById(userId).select("likedPosts");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const filter = {
    _id: { $in: user.likedPosts },
    status: "published",
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getUserLikeCount = async (userId) => {
  const user = await User.findById(userId).select("_id");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const result = await Post.aggregate([
    { $match: { author: user._id, status: "published" } },
    { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
  ]);

  return { totalLikes: result.length > 0 ? result[0].totalLikes : 0 };
};

const toggleCommentLike = async (authUser, commentId) => {
  const comment = await Comment.findById(commentId).select("isDeleted");
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.isDeleted) {
    throw new AppError("Cannot like deleted comment", 400);
  }

  const wasLiked = await likeRepository.isCommentLikedBy(commentId, authUser._id);

  if (wasLiked) {
    await likeRepository.removeCommentLike(commentId, authUser._id);
  } else {
    await likeRepository.addCommentLike(commentId, authUser._id);
  }

  const fresh = await likeRepository.getCommentLikesCount(commentId);

  return {
    isLiked: !wasLiked,
    likesCount: fresh.likesCount,
  };
};

const getCommentLikers = async (commentId) => {
  const comment = await likeRepository.findCommentLikers(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return { users: comment.likes.map((like) => like.user) };
};

module.exports = {
  togglePostLike,
  getPostLikers,
  getUserLikedPosts,
  getUserLikeCount,
  toggleCommentLike,
  getCommentLikers,
};

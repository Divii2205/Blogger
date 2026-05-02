const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");

const isPostLikedBy = async (postId, userId) => {
  const exists = await Post.exists({ _id: postId, "likes.user": userId });
  return Boolean(exists);
};

const addPostLike = (postId, userId) =>
  Post.updateOne(
    { _id: postId, "likes.user": { $ne: userId } },
    {
      $push: { likes: { user: userId, likedAt: new Date() } },
      $inc: { likesCount: 1 },
    }
  );

const removePostLike = (postId, userId) =>
  Post.updateOne(
    { _id: postId, "likes.user": userId },
    {
      $pull: { likes: { user: userId } },
      $inc: { likesCount: -1 },
    }
  );

const addPostToUserLiked = (userId, postId) =>
  User.updateOne({ _id: userId }, { $addToSet: { likedPosts: postId } });

const removePostFromUserLiked = (userId, postId) =>
  User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

const getPostLikesCount = (postId) =>
  Post.findById(postId).select("likesCount").lean();

const isCommentLikedBy = async (commentId, userId) => {
  const exists = await Comment.exists({ _id: commentId, "likes.user": userId });
  return Boolean(exists);
};

const addCommentLike = (commentId, userId) =>
  Comment.updateOne(
    { _id: commentId, "likes.user": { $ne: userId } },
    {
      $push: { likes: { user: userId, likedAt: new Date() } },
      $inc: { likesCount: 1 },
    }
  );

const removeCommentLike = (commentId, userId) =>
  Comment.updateOne(
    { _id: commentId, "likes.user": userId },
    {
      $pull: { likes: { user: userId } },
      $inc: { likesCount: -1 },
    }
  );

const getCommentLikesCount = (commentId) =>
  Comment.findById(commentId).select("likesCount").lean();

const findPostLikers = (postId) =>
  Post.findById(postId).populate("likes.user", "username fullName avatar");

const findCommentLikers = (commentId) =>
  Comment.findById(commentId).populate("likes.user", "username fullName avatar");

module.exports = {
  isPostLikedBy,
  addPostLike,
  removePostLike,
  addPostToUserLiked,
  removePostFromUserLiked,
  getPostLikesCount,
  isCommentLikedBy,
  addCommentLike,
  removeCommentLike,
  getCommentLikesCount,
  findPostLikers,
  findCommentLikers,
};

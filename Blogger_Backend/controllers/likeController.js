const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const likeService = require("../services/likeService");

const togglePostLike = asyncHandler(async (req, res) => {
  const result = await likeService.togglePostLike(req.user, req.params.postId);
  const message = result.isLiked ? "Post liked" : "Post unliked";
  return sendSuccess(res, result, message);
});

const getPostLikers = asyncHandler(async (req, res) => {
  const result = await likeService.getPostLikers(req.params.postId);
  return sendSuccess(res, result, "Likers fetched successfully");
});

const getUserLikedPosts = asyncHandler(async (req, res) => {
  const result = await likeService.getUserLikedPosts(
    req.params.userId,
    req.query
  );
  return sendSuccess(res, result, "Liked posts fetched successfully");
});

const getUserLikeCount = asyncHandler(async (req, res) => {
  const result = await likeService.getUserLikeCount(req.params.userId);
  return sendSuccess(res, result, "Like count fetched successfully");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const result = await likeService.toggleCommentLike(
    req.user,
    req.params.commentId
  );
  const message = result.isLiked ? "Comment liked" : "Comment unliked";
  return sendSuccess(res, result, message);
});

const getCommentLikers = asyncHandler(async (req, res) => {
  const result = await likeService.getCommentLikers(req.params.commentId);
  return sendSuccess(res, result, "Likers fetched successfully");
});

module.exports = {
  togglePostLike,
  getPostLikers,
  getUserLikedPosts,
  getUserLikeCount,
  toggleCommentLike,
  getCommentLikers,
};

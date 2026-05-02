const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const commentService = require("../services/commentService");
const likeService = require("../services/likeService");

const getPostComments = asyncHandler(async (req, res) => {
  const result = await commentService.getPostComments(
    req.params.postId,
    req.query
  );
  return sendSuccess(res, result, "Comments fetched successfully");
});

const createComment = asyncHandler(async (req, res) => {
  const result = await commentService.createComment(req.user, req.body);
  return sendSuccess(res, result, "Comment created successfully", 201);
});

const updateComment = asyncHandler(async (req, res) => {
  const result = await commentService.updateComment(
    req.user,
    req.params.id,
    req.body.content
  );
  return sendSuccess(res, result, "Comment updated successfully");
});

const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.user, req.params.id);
  return sendSuccess(res, {}, "Comment deleted successfully");
});

const getComment = asyncHandler(async (req, res) => {
  const result = await commentService.getCommentById(req.params.id);
  return sendSuccess(res, result, "Comment fetched successfully");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const result = await likeService.toggleCommentLike(req.user, req.params.id);
  const message = result.isLiked ? "Comment liked" : "Comment unliked";
  return sendSuccess(res, result, message);
});

module.exports = {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  getComment,
  toggleCommentLike,
};

const AppError = require("../utils/appError");
const { parsePagination } = require("../utils/query");
const Post = require("../models/Post");
const commentRepository = require("../repositories/commentRepository");

const getPostComments = async (postId, queryParams) => {
  const { page, limit, skip } = parsePagination(queryParams, {
    page: 1,
    limit: 20,
    maxLimit: 50,
  });

  const [comments, total] = await Promise.all([
    commentRepository.findTopLevelByPost(postId, skip, limit),
    commentRepository.countTopLevelByPost(postId),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const createComment = async (authUser, payload) => {
  const { content, postId, parentCommentId } = payload;

  const post = await Post.findById(postId).select("_id");
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (parentCommentId) {
    const parent = await commentRepository.findById(parentCommentId);
    if (!parent) {
      throw new AppError("Parent comment not found", 404);
    }
  }

  let comment = await commentRepository.createComment({
    content,
    author: authUser._id,
    post: postId,
    parentComment: parentCommentId || null,
  });

  if (parentCommentId) {
    await commentRepository.pushReply(parentCommentId, comment._id);
  }

  await commentRepository.incPostCommentCount(postId, 1);

  comment = await commentRepository.findByIdWithAuthor(comment._id);

  return { comment };
};

const updateComment = async (authUser, commentId, content) => {
  const comment = await commentRepository.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.author.toString() !== authUser._id.toString()) {
    throw new AppError("Not authorized to update this comment", 403);
  }
  if (comment.isDeleted) {
    throw new AppError("Cannot update deleted comment", 400);
  }

  comment.content = content;
  comment.isEdited = true;
  comment.editedAt = new Date();

  await comment.save();
  await comment.populate("author", "username fullName avatar");

  return { comment };
};

const deleteComment = async (authUser, commentId) => {
  const comment = await commentRepository.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.author.toString() !== authUser._id.toString()) {
    throw new AppError("Not authorized to delete this comment", 403);
  }
  if (comment.isDeleted) {
    return;
  }

  await comment.softDelete();
  await commentRepository.incPostCommentCount(comment.post, -1);
};

const getCommentById = async (commentId) => {
  const comment = await commentRepository.findByIdWithReplies(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return { comment };
};

module.exports = {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentById,
};

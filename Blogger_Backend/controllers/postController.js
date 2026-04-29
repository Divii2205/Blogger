const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const postService = require("../services/postService");

const getPosts = asyncHandler(async (req, res) => {
  const result = await postService.listPublishedPosts(req.query, req.user);
  return sendSuccess(res, result, "Posts fetched successfully");
});

const getTrendingPosts = asyncHandler(async (req, res) => {
  const posts = await postService.listTrendingPosts(req.query, req.user);
  return sendSuccess(res, { posts }, "Trending posts fetched successfully");
});

const getFeedPosts = asyncHandler(async (req, res) => {
  const result = await postService.listFeedPosts(req.query, req.user);
  return sendSuccess(res, result, "Feed fetched successfully");
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id, req.user);
  return sendSuccess(res, { post }, "Post fetched successfully");
});

const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await postService.getPostBySlug(req.params.slug, req.user);
  return sendSuccess(res, { post }, "Post fetched successfully");
});

const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.user);
  return sendSuccess(res, { post }, "Post created successfully", 201);
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.body, req.user);
  return sendSuccess(res, { post }, "Post updated successfully");
});

const deletePost = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user);
  return sendSuccess(res, {}, "Post deleted successfully");
});

const getPostsByUsername = asyncHandler(async (req, res) => {
  const result = await postService.getPostsByUsername(req.params.username, req.query, req.user);
  return sendSuccess(res, result, "User posts fetched successfully");
});

module.exports = {
  getPosts,
  getTrendingPosts,
  getFeedPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostsByUsername,
};

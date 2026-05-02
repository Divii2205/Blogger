const express = require("express");
const { protect, optionalAuth } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  createPostValidation,
  updatePostValidation,
} = require("../validators/postsValidators");
const {
  getPosts,
  getTrendingPosts,
  getFeedPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getPostsByUsername,
  getPopularTags,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", optionalAuth, getPosts);
router.get("/trending", optionalAuth, getTrendingPosts);
router.get("/tags", getPopularTags);
router.get("/feed", protect, getFeedPosts);
router.get("/user/:username", optionalAuth, getPostsByUsername);
router.get("/slug/:slug", optionalAuth, getPostBySlug);
router.get("/:id", optionalAuth, getPostById);
router.post("/", protect, createPostValidation, validateRequest, createPost);
router.put("/:id", protect, updatePostValidation, validateRequest, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;

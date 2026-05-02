const express = require("express");
const { protect, optionalAuth } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  createCommentValidation,
  updateCommentValidation,
} = require("../validators/commentsValidators");
const {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  getComment,
  toggleCommentLike,
} = require("../controllers/commentController");

const router = express.Router();

// Specific paths first. optionalAuth so the response can include each
// comment's `isLiked` flag for the current viewer when one is signed in.
router.get("/post/:postId", optionalAuth, getPostComments);

router.post("/", protect, createCommentValidation, validateRequest, createComment);
router.put(
  "/:id",
  protect,
  updateCommentValidation,
  validateRequest,
  updateComment
);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, toggleCommentLike);
router.get("/:id", getComment);

module.exports = router;

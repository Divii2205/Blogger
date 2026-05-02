const express = require("express");
const { protect } = require("../middleware/auth");
const {
  togglePostLike,
  getPostLikers,
  getUserLikedPosts,
  getUserLikeCount,
  toggleCommentLike,
  getCommentLikers,
} = require("../controllers/likeController");

const router = express.Router();

router.post("/post/:postId", protect, togglePostLike);
router.get("/post/:postId/users", getPostLikers);

router.get("/user/:userId/posts", getUserLikedPosts);
router.get("/user/:userId/count", getUserLikeCount);

router.post("/comment/:commentId", protect, toggleCommentLike);
router.get("/comment/:commentId/users", getCommentLikers);

module.exports = router;

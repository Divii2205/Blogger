const express = require("express");
const { protect } = require("../middleware/auth");
const {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getSuggestions,
  getMutualFollowers,
} = require("../controllers/followController");

const router = express.Router();

// Specific paths first so they don't get shadowed by /:userId.
router.get("/suggestions", protect, getSuggestions);
router.get("/mutual/:userId", protect, getMutualFollowers);

router.post("/:userId", protect, toggleFollow);
router.get("/:userId/status", protect, getFollowStatus);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

module.exports = router;

const express = require("express");
const { protect, optionalAuth } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  updateProfileValidation,
  updateAvatarValidation,
  updatePreferencesValidation,
} = require("../validators/usersValidators");
const {
  listUsers,
  getProfile,
  updateProfile,
  updateAvatar,
  updatePreferences,
  getFollowers,
  getFollowing,
  toggleBookmark,
  getBookmarks,
} = require("../controllers/userController");

const router = express.Router();

// Specific paths first so they don't get shadowed by /:username.
router.get("/", listUsers);
router.get("/me/bookmarks", protect, getBookmarks);
router.post("/bookmarks/:postId", protect, toggleBookmark);

router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validateRequest,
  updateProfile
);
router.put(
  "/avatar",
  protect,
  updateAvatarValidation,
  validateRequest,
  updateAvatar
);
router.put(
  "/preferences",
  protect,
  updatePreferencesValidation,
  validateRequest,
  updatePreferences
);

router.get("/:username", optionalAuth, getProfile);
router.get("/:username/followers", getFollowers);
router.get("/:username/following", getFollowing);

module.exports = router;

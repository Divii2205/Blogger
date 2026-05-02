const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const userService = require("../services/userService");

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return sendSuccess(res, result, "Users fetched successfully");
});

const getProfile = asyncHandler(async (req, res) => {
  const result = await userService.getProfileByUsername(
    req.params.username,
    req.user
  );
  return sendSuccess(res, result, "Profile fetched successfully");
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user, req.body);
  return sendSuccess(res, { user }, "Profile updated successfully");
});

const updateAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user, req.body.avatar);
  return sendSuccess(res, { user }, "Avatar updated successfully");
});

const updatePreferences = asyncHandler(async (req, res) => {
  const user = await userService.updatePreferences(
    req.user,
    req.body.preferences
  );
  return sendSuccess(res, { user }, "Preferences updated successfully");
});

const getFollowers = asyncHandler(async (req, res) => {
  const followers = await userService.getFollowersByUsername(
    req.params.username
  );
  return sendSuccess(res, { followers }, "Followers fetched successfully");
});

const getFollowing = asyncHandler(async (req, res) => {
  const following = await userService.getFollowingByUsername(
    req.params.username
  );
  return sendSuccess(res, { following }, "Following fetched successfully");
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const result = await userService.toggleBookmark(req.user, req.params.postId);
  const message = result.isSaved
    ? "Post bookmarked"
    : "Post removed from bookmarks";
  return sendSuccess(res, result, message);
});

const getBookmarks = asyncHandler(async (req, res) => {
  const result = await userService.getBookmarks(req.user, req.query);
  return sendSuccess(res, result, "Bookmarks fetched successfully");
});

module.exports = {
  listUsers,
  getProfile,
  updateProfile,
  updateAvatar,
  updatePreferences,
  getFollowers,
  getFollowing,
  toggleBookmark,
  getBookmarks,
};

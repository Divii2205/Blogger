const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const followService = require("../services/followService");

const toggleFollow = asyncHandler(async (req, res) => {
  const result = await followService.toggleFollow(req.user, req.params.userId);
  const message = result.isFollowing
    ? "User followed successfully"
    : "User unfollowed successfully";
  return sendSuccess(res, result, message);
});

const getFollowStatus = asyncHandler(async (req, res) => {
  const result = await followService.getFollowStatus(
    req.user,
    req.params.userId
  );
  return sendSuccess(res, result, "Follow status fetched");
});

const getFollowers = asyncHandler(async (req, res) => {
  const result = await followService.getFollowersPage(
    req.params.userId,
    req.query
  );
  return sendSuccess(res, result, "Followers fetched successfully");
});

const getFollowing = asyncHandler(async (req, res) => {
  const result = await followService.getFollowingPage(
    req.params.userId,
    req.query
  );
  return sendSuccess(res, result, "Following fetched successfully");
});

const getSuggestions = asyncHandler(async (req, res) => {
  const result = await followService.getSuggestions(req.user, req.query);
  return sendSuccess(res, result, "Suggestions fetched successfully");
});

const getMutualFollowers = asyncHandler(async (req, res) => {
  const result = await followService.getMutualFollowers(
    req.user,
    req.params.userId
  );
  return sendSuccess(res, result, "Mutual followers fetched successfully");
});

module.exports = {
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getSuggestions,
  getMutualFollowers,
};

const AppError = require("../utils/appError");
const { parsePagination } = require("../utils/query");
const followRepository = require("../repositories/followRepository");
const User = require("../models/User");

const toggleFollow = async (authUser, targetUserId) => {
  const currentUserId = authUser._id;

  if (targetUserId === currentUserId.toString()) {
    throw new AppError("You cannot follow yourself", 400);
  }

  const targetUser = await User.findById(targetUserId).select("_id");
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  const alreadyFollowing = await followRepository.isFollowing(
    currentUserId,
    targetUserId
  );

  if (alreadyFollowing) {
    await followRepository.removeFollow(currentUserId, targetUserId);
  } else {
    await followRepository.addFollow(currentUserId, targetUserId);
  }

  const [currentCounts, targetCounts] = await Promise.all([
    followRepository.getCounts(currentUserId),
    followRepository.getCounts(targetUserId),
  ]);

  const isFollowing = !alreadyFollowing;

  return {
    isFollowing,
    followersCount: targetCounts.followersCount,
    followingCount: currentCounts.followingCount,
    targetUser: {
      _id: targetUser._id,
      followersCount: targetCounts.followersCount,
      followingCount: targetCounts.followingCount,
    },
  };
};

const getFollowStatus = async (authUser, targetUserId) => {
  const isFollowing = await followRepository.isFollowing(
    authUser._id,
    targetUserId
  );
  return { isFollowing };
};

const getFollowersPage = async (userId, queryParams) => {
  const { page, limit, skip } = parsePagination(queryParams);

  const user = await followRepository.findFollowersPage(userId, skip, limit);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const total = await followRepository.countWhereFollowing(userId);

  return {
    followers: user.followers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getFollowingPage = async (userId, queryParams) => {
  const { page, limit, skip } = parsePagination(queryParams);

  const user = await followRepository.findFollowingPage(userId, skip, limit);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const total = await followRepository.countWhereFollowedBy(userId);

  return {
    following: user.following,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getSuggestions = async (authUser, queryParams) => {
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));
  const excludeIds = [...(authUser.following || []), authUser._id];
  const suggestions = await followRepository.findSuggestions(excludeIds, limit);
  return { suggestions };
};

const getMutualFollowers = async (authUser, targetUserId) => {
  const targetUser = await User.findById(targetUserId).select("_id");
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  const mutualFollowers = await followRepository.findMutualFollowers(
    authUser.followers || [],
    targetUserId,
    10
  );

  return { mutualFollowers };
};

module.exports = {
  toggleFollow,
  getFollowStatus,
  getFollowersPage,
  getFollowingPage,
  getSuggestions,
  getMutualFollowers,
};

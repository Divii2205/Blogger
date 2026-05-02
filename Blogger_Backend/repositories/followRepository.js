const User = require("../models/User");

const findFollowingIds = (userId) =>
  User.findById(userId).select("following").lean();

const isFollowing = async (currentUserId, targetUserId) => {
  const exists = await User.exists({
    _id: currentUserId,
    following: targetUserId,
  });
  return Boolean(exists);
};

// Atomic add: only update if not already in the set, so the counter never
// drifts when two concurrent follow requests fire.
const addFollow = async (currentUserId, targetUserId) => {
  const followerUpdate = await User.updateOne(
    { _id: currentUserId, following: { $ne: targetUserId } },
    {
      $addToSet: { following: targetUserId },
      $inc: { followingCount: 1 },
    }
  );

  if (followerUpdate.modifiedCount === 0) {
    return { changed: false };
  }

  await User.updateOne(
    { _id: targetUserId, followers: { $ne: currentUserId } },
    {
      $addToSet: { followers: currentUserId },
      $inc: { followersCount: 1 },
    }
  );

  return { changed: true };
};

const removeFollow = async (currentUserId, targetUserId) => {
  const followerUpdate = await User.updateOne(
    { _id: currentUserId, following: targetUserId },
    {
      $pull: { following: targetUserId },
      $inc: { followingCount: -1 },
    }
  );

  if (followerUpdate.modifiedCount === 0) {
    return { changed: false };
  }

  await User.updateOne(
    { _id: targetUserId, followers: currentUserId },
    {
      $pull: { followers: currentUserId },
      $inc: { followersCount: -1 },
    }
  );

  return { changed: true };
};

const getCounts = (userId) =>
  User.findById(userId).select("followersCount followingCount").lean();

const findFollowersPage = (userId, skip, limit) =>
  User.findById(userId).populate({
    path: "followers",
    select: "username fullName avatar bio followersCount followingCount",
    options: { skip, limit },
  });

const findFollowingPage = (userId, skip, limit) =>
  User.findById(userId).populate({
    path: "following",
    select: "username fullName avatar bio followersCount followingCount",
    options: { skip, limit },
  });

const countWhereFollowing = (userId) =>
  User.countDocuments({ following: userId });

const countWhereFollowedBy = (userId) =>
  User.countDocuments({ followers: userId });

const findSuggestions = (excludeIds, limit) =>
  User.find({
    _id: { $nin: excludeIds },
    followersCount: { $gte: 1 },
  })
    .select("username fullName avatar bio followersCount followingCount")
    .sort({ followersCount: -1, createdAt: -1 })
    .limit(limit);

const findMutualFollowers = (currentUserFollowerIds, targetUserId, limit) =>
  User.find({
    _id: { $in: currentUserFollowerIds },
    following: targetUserId,
  })
    .select("username fullName avatar bio followersCount followingCount")
    .limit(limit);

module.exports = {
  findFollowingIds,
  isFollowing,
  addFollow,
  removeFollow,
  getCounts,
  findFollowersPage,
  findFollowingPage,
  countWhereFollowing,
  countWhereFollowedBy,
  findSuggestions,
  findMutualFollowers,
};

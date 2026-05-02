const AppError = require("../utils/appError");
const { parsePagination } = require("../utils/query");
const userRepository = require("../repositories/userRepository");
const User = require("../models/User");
const Post = require("../models/Post");

const listUsers = async (queryParams) => {
  const { page, limit, skip } = parsePagination(queryParams);
  const search = (queryParams.search || "").trim();

  const query = search
    ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getProfileByUsername = async (username, authUser) => {
  // Don't populate followers/following here — those arrays can be huge and
  // the page only needs the counters (already on the doc). Detail lists are
  // fetched on demand via /users/:username/followers and /following.
  const user = await User.findOne({ username }).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const [posts, isFollowingExists] = await Promise.all([
    Post.find({ author: user._id, status: "published" })
      .sort({ publishedAt: -1 })
      .limit(10)
      .populate("author", "username fullName avatar"),
    authUser
      ? User.exists({ _id: user._id, followers: authUser._id })
      : Promise.resolve(null),
  ]);

  return { user, posts, isFollowing: Boolean(isFollowingExists) };
};

const updateProfile = async (authUser, payload) => {
  const updateData = {};
  ["fullName", "bio", "website", "location"].forEach((field) => {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  });

  // Merge incoming social links over the existing object so a partial
  // update (e.g. only github) doesn't clobber the other handles.
  if (payload.socialLinks && typeof payload.socialLinks === "object") {
    const existing = authUser.socialLinks || {};
    updateData.socialLinks = {
      twitter: payload.socialLinks.twitter ?? existing.twitter ?? "",
      github: payload.socialLinks.github ?? existing.github ?? "",
      linkedin: payload.socialLinks.linkedin ?? existing.linkedin ?? "",
    };
  }

  const user = await userRepository.updateById(authUser._id, updateData);
  return user;
};

const updateAvatar = async (authUser, avatar) => {
  const user = await userRepository.updateById(authUser._id, { avatar });
  return user;
};

const updatePreferences = async (authUser, preferencesPayload) => {
  const merged = {
    ...(authUser.preferences || {}),
    ...(preferencesPayload || {}),
  };
  const user = await userRepository.updateById(authUser._id, {
    preferences: merged,
  });
  return user;
};

const getFollowersByUsername = async (username) => {
  const user = await User.findOne({ username })
    .select("followers")
    .populate(
      "followers",
      "username fullName avatar followersCount followingCount"
    );

  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.followers;
};

const getFollowingByUsername = async (username) => {
  const user = await User.findOne({ username })
    .select("following")
    .populate(
      "following",
      "username fullName avatar followersCount followingCount"
    );

  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.following;
};

const toggleBookmark = async (authUser, postId) => {
  const post = await Post.findById(postId).select("_id");
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const user = await User.findById(authUser._id).select("savedPosts");
  const isSaved = user.savedPosts.some(
    (id) => id.toString() === postId.toString()
  );

  // Atomic update — avoids the read-modify-write race where two concurrent
  // requests both see "not saved" and both push, leaving duplicates.
  await User.updateOne(
    { _id: authUser._id },
    isSaved
      ? { $pull: { savedPosts: postId } }
      : { $addToSet: { savedPosts: postId } }
  );

  return { isSaved: !isSaved };
};

const getBookmarks = async (authUser, queryParams) => {
  const { page, limit, skip } = parsePagination(queryParams);

  const user = await User.findById(authUser._id).populate({
    path: "savedPosts",
    populate: { path: "author", select: "username fullName avatar" },
    options: { sort: { publishedAt: -1 }, skip, limit },
  });

  const total = user.savedPosts.length;

  const posts = user.savedPosts.map((post) => {
    const obj = post.toObject();
    obj.isLiked = post.isLikedBy(authUser._id);
    obj.isSaved = true;
    return obj;
  });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  listUsers,
  getProfileByUsername,
  updateProfile,
  updateAvatar,
  updatePreferences,
  getFollowersByUsername,
  getFollowingByUsername,
  toggleBookmark,
  getBookmarks,
};

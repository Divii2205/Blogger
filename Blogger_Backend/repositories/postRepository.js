const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

const findAuthorByUsername = (username) => User.findOne({ username });

const findPosts = (query, sort, skip, limit) =>
  Post.find(query)
    .populate("author", "username fullName avatar")
    .sort(sort)
    .skip(skip)
    .limit(limit);

const countPosts = (query) => Post.countDocuments(query);

const findPostById = (id) =>
  Post.findById(id).populate("author", "username fullName avatar bio followersCount");

const findPostBySlug = (slug) =>
  Post.findOne({ slug, status: "published" }).populate(
    "author",
    "username fullName avatar bio followersCount"
  );

const findRawPostById = (id) => Post.findById(id);

const createPost = (payload) => Post.create(payload);

const populateAuthor = (post) => post.populate("author", "username fullName avatar");

const deletePostById = (id) => Post.findByIdAndDelete(id);

// Pull post references from every user's liked/saved arrays and delete its
// comments before removing the post itself. Pulls run first so a failure
// during cleanup leaves the post intact and the operation is retryable.
const cascadeDeletePost = async (postId) => {
  await Promise.all([
    Comment.deleteMany({ post: postId }),
    User.updateMany(
      { likedPosts: postId },
      { $pull: { likedPosts: postId } }
    ),
    User.updateMany(
      { savedPosts: postId },
      { $pull: { savedPosts: postId } }
    ),
  ]);
  return Post.findByIdAndDelete(postId);
};

const incrementViews = (postId) =>
  Post.updateOne({ _id: postId }, { $inc: { views: 1 } });

const incrementUserPostCount = (userId, value) =>
  User.findByIdAndUpdate(userId, { $inc: { postsCount: value } });

const findUserFollowing = (userId) => User.findById(userId).select("following");

// Aggregate the most-used tags across published posts. Used by the
// search/filter UI so users can pick from real categories instead of
// guessing tag names.
const aggregatePopularTags = (limit) =>
  Post.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 0, tag: "$_id", count: 1 } },
  ]);

module.exports = {
  findAuthorByUsername,
  findPosts,
  countPosts,
  findPostById,
  findPostBySlug,
  findRawPostById,
  createPost,
  populateAuthor,
  deletePostById,
  cascadeDeletePost,
  incrementViews,
  incrementUserPostCount,
  findUserFollowing,
  aggregatePopularTags,
};

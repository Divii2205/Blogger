const Post = require("../models/Post");
const User = require("../models/User");

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

const incrementUserPostCount = (userId, value) =>
  User.findByIdAndUpdate(userId, { $inc: { postsCount: value } });

const findUserFollowing = (userId) => User.findById(userId).select("following");

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
  incrementUserPostCount,
  findUserFollowing,
};

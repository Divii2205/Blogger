const User = require("../models/User");

const findById = (id) => User.findById(id);

const findByIdWithoutPassword = (id) => User.findById(id).select("-password");

const findByEmailWithPassword = (email) =>
  User.findOne({ email }).select("+password");

const findByEmail = (email) => User.findOne({ email });

const findByGoogleId = (googleId) => User.findOne({ googleId });

const findByUsername = (username) => User.findOne({ username });

const findExistingByEmailOrUsername = (email, username) =>
  User.findOne({ $or: [{ email }, { username }] });

const createUser = (data) => User.create(data);

const updateById = (id, update, options = { new: true, runValidators: true }) =>
  User.findByIdAndUpdate(id, update, options).select("-password");

const incrementPostsCount = (userId, value) =>
  User.findByIdAndUpdate(userId, { $inc: { postsCount: value } });

module.exports = {
  findById,
  findByIdWithoutPassword,
  findByEmailWithPassword,
  findByEmail,
  findByGoogleId,
  findByUsername,
  findExistingByEmailOrUsername,
  createUser,
  updateById,
  incrementPostsCount,
};

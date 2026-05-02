const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const authService = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendSuccess(res, result, "User registered successfully", 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return sendSuccess(res, result, "Login successful");
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user);
  return sendSuccess(res, { user }, "Current user fetched");
});

const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, {}, "Logged out successfully");
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = authService.refreshAuthToken(req.user);
  return sendSuccess(res, { token }, "Token refreshed");
});

module.exports = { register, login, getCurrentUser, logout, refreshToken };

const express = require("express");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");
const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidators");
const {
  register,
  login,
  getCurrentUser,
  logout,
  refreshToken,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);
router.post("/refresh", protect, refreshToken);

module.exports = router;

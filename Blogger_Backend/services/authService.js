const AppError = require("../utils/appError");
const userRepository = require("../repositories/userRepository");

const registerUser = async ({ username, email, password, fullName }) => {
  const existing = await userRepository.findExistingByEmailOrUsername(
    email,
    username
  );
  if (existing) {
    const message =
      existing.email === email
        ? "User with this email already exists"
        : "Username is already taken";
    throw new AppError(message, 400);
  }

  const user = await userRepository.createUser({
    username,
    email,
    password,
    fullName,
  });

  const token = user.generateAuthToken();
  return { user: user.toJSON(), token };
};

const loginUser = async ({ email, password }) => {
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = user.generateAuthToken();
  return { user: user.toJSON(), token };
};

const getCurrentUser = async (authUser) => {
  const user = await userRepository.findByIdWithoutPassword(authUser._id);
  if (!user) {
    throw new AppError("User no longer exists", 404);
  }
  return user;
};

const refreshAuthToken = (authUser) => authUser.generateAuthToken();

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAuthToken,
};

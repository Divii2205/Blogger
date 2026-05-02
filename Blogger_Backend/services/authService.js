const { OAuth2Client } = require("google-auth-library");
const AppError = require("../utils/appError");
const userRepository = require("../repositories/userRepository");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Strip non-alphanumerics, then append a short random suffix until we find a
// free username. Google emails like "first.last@gmail.com" become "firstlast"
// then "firstlast4f1" if taken — keeps usernames legible without leaking PII.
const generateUniqueUsername = async (email) => {
  const base = (email.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) || "user";

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const suffix = attempt === 0 ? "" : Math.random().toString(36).slice(2, 6);
    const candidate = `${base}${suffix}`.slice(0, 30);
    const taken = await userRepository.findByUsername(candidate);
    if (!taken) return candidate;
  }
  throw new AppError("Could not generate a unique username", 500);
};

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

// Verifies the Google id_token signature + audience against our client ID.
// We trust the email_verified claim from Google to skip our own email
// verification step. Three branches:
//   1. Existing googleId match → straight login
//   2. Existing local account with this email → refuse (force password login,
//      so a stolen Google session can't take over a password account)
//   3. No match → create a fresh google-provider account
const googleSignIn = async (idToken) => {
  if (!idToken) {
    throw new AppError("Google credential missing", 400);
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google sign-in is not configured", 500);
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new AppError("Invalid Google credential", 401);
  }

  if (!payload || !payload.email || !payload.email_verified) {
    throw new AppError("Google account email is not verified", 401);
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await userRepository.findByGoogleId(googleId);
  if (user) {
    return { user: user.toJSON(), token: user.generateAuthToken() };
  }

  const existingByEmail = await userRepository.findByEmail(email);
  if (existingByEmail && existingByEmail.authProvider !== "google") {
    throw new AppError(
      "An account with this email already exists. Please sign in with your password.",
      409
    );
  }

  const username = await generateUniqueUsername(email);
  user = await userRepository.createUser({
    username,
    email,
    fullName: name || username,
    avatar: picture || "",
    authProvider: "google",
    googleId,
  });

  return { user: user.toJSON(), token: user.generateAuthToken() };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAuthToken,
  googleSignIn,
};

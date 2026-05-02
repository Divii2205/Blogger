const { body } = require("express-validator");

const updateProfileValidation = [
  body("fullName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Full name must be between 1 and 50 characters"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("website")
    .optional({ values: "falsy" })
    .isURL()
    .withMessage("Please provide a valid website URL"),
  body("location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location cannot exceed 100 characters"),
  // socialLinks fields are clearable — `{ values: "falsy" }` lets the user
  // empty them out without tripping the URL validator.
  body("socialLinks.twitter")
    .optional({ values: "falsy" })
    .isURL()
    .withMessage("Twitter must be a valid URL"),
  body("socialLinks.github")
    .optional({ values: "falsy" })
    .isURL()
    .withMessage("GitHub must be a valid URL"),
  body("socialLinks.linkedin")
    .optional({ values: "falsy" })
    .isURL()
    .withMessage("LinkedIn must be a valid URL"),
];

const updateAvatarValidation = [
  body("avatar").isURL().withMessage("Please provide a valid avatar URL"),
];

const updatePreferencesValidation = [
  body("preferences.theme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage("Theme must be either light or dark"),
  body("preferences.notifications.email")
    .optional()
    .isBoolean()
    .withMessage("Email notifications must be boolean"),
  body("preferences.notifications.likes")
    .optional()
    .isBoolean()
    .withMessage("Likes notifications must be boolean"),
  body("preferences.notifications.comments")
    .optional()
    .isBoolean()
    .withMessage("Comments notifications must be boolean"),
  body("preferences.notifications.follows")
    .optional()
    .isBoolean()
    .withMessage("Follows notifications must be boolean"),
];

module.exports = {
  updateProfileValidation,
  updateAvatarValidation,
  updatePreferencesValidation,
};

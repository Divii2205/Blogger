const { body } = require("express-validator");

const createPostValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 50000 })
    .withMessage("Content cannot exceed 50,000 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either draft or published"),
];

const updatePostValidation = [
  body("title")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("content")
    .optional()
    .isLength({ max: 50000 })
    .withMessage("Content cannot exceed 50,000 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),
];

module.exports = {
  createPostValidation,
  updatePostValidation,
};

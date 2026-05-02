const { body } = require("express-validator");

const createCommentValidation = [
  body("content")
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
  body("postId")
    .notEmpty()
    .withMessage("Post ID is required")
    .isMongoId()
    .withMessage("Invalid post ID"),
  body("parentCommentId")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent comment ID"),
];

const updateCommentValidation = [
  body("content")
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
];

module.exports = {
  createCommentValidation,
  updateCommentValidation,
};

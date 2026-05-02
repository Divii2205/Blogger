const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const uploadService = require("../services/uploadService");

const uploadImage = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadImage(req.file);
  return sendSuccess(res, result, "Image uploaded successfully");
});

module.exports = {
  uploadImage,
};

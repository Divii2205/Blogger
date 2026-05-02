const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/appError");

const uploadImage = async (file) => {
  if (!file) {
    throw new AppError("Please upload an image", 400);
  }

  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "blogger_assets",
    resource_type: "auto",
  });

  return { url: result.secure_url };
};

module.exports = {
  uploadImage,
};

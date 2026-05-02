const express = require("express");
const { protect } = require("../middleware/auth");
const { imageUpload } = require("../middleware/multerUpload");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

router.post("/", protect, imageUpload.single("image"), uploadImage);

module.exports = router;

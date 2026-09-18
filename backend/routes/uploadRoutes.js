const express = require("express");
const router = express.Router()
const { uploadChatMedia } = require("../controllers/uploadController")
const protect = require("../middleware/authMiddleware");
const chatUpload = require("../middleware/chatUploadMiddleware")

router.post("/chat-media", protect, chatUpload.single("file"), uploadChatMedia)

module.exports = router;
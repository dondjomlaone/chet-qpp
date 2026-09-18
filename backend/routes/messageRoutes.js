const express = require("express");
const router = express.Router();
const { getMessages, getPrivateMessages } = require("../controllers/messageController")
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getMessages);
router.get("/private/:userId", protect, getPrivateMessages)

module.exports = router;
const express = require("express");
const router = express.Router();
const{ updateProfile, getProfile } = require("../controllers/userController")
const protect = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile)

module.exports = router;
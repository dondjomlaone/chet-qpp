const express = require("express");
const router = express.Router();
const{ updateProfile, getProfile, getUserById } = require("../controllers/userController")
const protect = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile)
router.get("/:id", protect, getUserById);


module.exports = router;
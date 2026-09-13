const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars/");
    },
    filename: (req, file, cb) => {
        const userId = req.userId || "unknown"
        const uniqueName = `${userId}-${Date.now()}${path.extname(file.originalname)}`
        cb(null, uniqueName);
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true)
        } else {
            cb(new Error("Samo slike su dozvoljene"), false)
        }
    },
})

module.exports = upload;
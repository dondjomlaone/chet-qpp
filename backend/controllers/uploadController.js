const uploadChatMedia = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Fajl nije poslat" });
    }

    const mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";

    res.status(200).json({
        mediaUrl: `/uploads/chat/${req.file.filename}`,
        mediaType: mediaType,
    });
};

module.exports = { uploadChatMedia }




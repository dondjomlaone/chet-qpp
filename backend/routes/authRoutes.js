const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// Ruta za registraciju i prijavu korisnika
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
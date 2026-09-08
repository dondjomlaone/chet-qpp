const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Registrujem novog korisnika
const registerUser = async (req, res) => {
    const { username, email, phone, password } = req.body;

    // Provjeravam da li su svi potrebni podaci poslati
    if (!username || !email || !phone || !password) {
        return res.status(400).json({ message: "Svi podaci su obavezni" });
    }

    // Provjeravam da li korisnik već postoji
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Korisnik sa ovim emailom već postoji" });
    }

    // Hashiram lozinku
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Provjeravanje i cuvanje novog korisnika u bazi
    const newUser = new User({
        username,
        email,
        phone,
        password: hashedPassword,
    });

    await newUser.save();

    //Proizvodim JWT token odma nakon registracije
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
        message: "Korisnik uspješno registrovan",
        token,
        user: {
            id: newUser._id,
            username: newUser.username,
            phone: newUser.phone,
            email: newUser.email
        }
    });
}


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //Provjeravam da li ce poslati email i password
        if (!email || !password) {
            return res.status(400).json({ message: "Svi podaci su obavezni" });
        }

        //Provjeravam da li korisnik postoji
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Neispravan email ili lozinka" });
        }

        //Provjeravam da li je lozinka ispravna
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Neispravan email ili lozinka" });
        }

        //Proizvodim JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            message: "Uspješna prijava",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Došlo je do greške prilikom prijave", error });
    }
}

module.exports = {
    registerUser,
    loginUser
};
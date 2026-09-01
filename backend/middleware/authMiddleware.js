const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    // Provjeravam da li je token poslan u headeru
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
        try {
            token = authHeader.split(" ")[1]; // uzimam samo dio koji se nalazi nakon "Bearer"
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // provjeravam da li je token validan
            req.userId = decoded.id; // dodajem userId u request objekat za kasniju upotrebu
            next(); // sve ok, nastavljam dalje ka pravoj ruti
        } catch (error) {
            res.status(401).json({ message: "Niste autorizovani" });
        }
    }
    if (!token) {
        res.status(401).json({ message: "Niste autorizovani, token nije poslan" });
    }
}           

module.exports = protect
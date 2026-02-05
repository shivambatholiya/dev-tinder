const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        console.log("Cookies:", req);
        const { token } = req.cookies;
        console.log("Auth Token:", req.cookies);
        if (!token) {
            return res.status(401).send("AUTH_FAILED: No token provided");
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error("User not found"); 
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).send("AUTH_FAILED: " + err.message);
    }
};

module.exports = { userAuth };

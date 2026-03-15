const { validateSignupData } = require('../utils/validation')
const User = require('../models/user')
const bcrypt = require("bcrypt");

// Signup api - POST /signup - signup a user
const signup = async (req, res) => {
    try {
        // validate the signup data
        validateSignupData(req);

        // Signup logic here
        const { firstName, lastName, emailId, password, age, gender, about} = req.body;

        const photoUrl = req.file
            ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
            : "";

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            age,
            gender,
            about,
            photoUrl
        });

        console.log("User object before saving:", user);

        await user.save();

        const token = user.getJWT();
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'Strict', expires: new Date(Date.now() + 3600000) }); // 1 hour expiry

        res.status(201).json({
            message: "User signed up successfully",
            data: {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName
            }
        })
    } catch (err) {
        console.log("Signup Error:", err.message);
        return res.status(500).json({ message: "SIGNUP_FAILED: " + err.message });
    }
};

// Login api - POST /login - login a user
const login = async (req, res) => {
    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({ emailId });

        if(!user) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordMatch = await user.validatePassword(password);
        console.log("Password Match:", isPasswordMatch);

        if (!isPasswordMatch) {
            throw new Error("Invalid Credentials");
        }

        // Create a JWT token and set it in cookie
        const token = user.getJWT();
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'Strict', expires: new Date(Date.now() + 3600000) }); // 1 hour expiry
        
        res.json({
            message: "User logged in successfully",
            data: {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (err) {
        console.log("Login Error:", err.message);
        return res.status(401).send("LOGIN_FAILED: " + err.message);
    }
};

// Logout api - POST /logout - logout a user
const logout = async (req, res) => {
    try {
        const {token} = req.cookies;
        await res.cookie("token", null, { httpOnly: true, express: new Date(Date.now()) });

        res.send("User Logout Successfully");
    } catch {
        return res.status(500).send("LOGOUT_FAILED: " + err.message)
    }
};

module.exports = {
    signup,
    login,
    logout
}
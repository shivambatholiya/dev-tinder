const express = require('express');
const { validateSignupData } = require('../utils/validation')
const User = require('../models/user')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        // validate the signup data
        validateSignupData(req);

        // Signup logic here
        const { firstName, lastName, email, password} = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId: email,
            password: hashedPassword
        });

        await user.save();

        const token = user.getJWT();
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'Strict', expires: new Date(Date.now() + 3600000) }); // 1 hour expiry

        res.status(201).json({
            message: "User signed up successfully",
            token: token,
            data: {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName
            }
        })
    } catch (err) {
        return res.status(500).send("Error signing up user: " + err.message);
    }
});

// Login api - POST /login - login a user
router.post("/login", async (req, res) => {
    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({ emailId });

        if(!user) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordMatch = await user.validatePassword(password);

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
        return res.status(500).send("LOGIN_FAILED: " + err.message);
    }
})

router.post("/logout", async (req, res) => {
    try {
        const {token} = req.cookies;
        await res.cookie("token", null, { httpOnly: true, express: new Date(Date.now()) });

        res.send("User Logout Successfully");
    } catch {
        return res.status(500).send("LOGOUT_FAILED: " + err.message)
    }
});

module.exports = router;
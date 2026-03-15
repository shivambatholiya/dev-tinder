const { validateEditProfileData } = require("../utils/validation");
const User = require("../models/user");

// View profile api - GET /profile/view - get the profile of logged in user
exports.viewProfile = async (req, res) => {
    try {
        const user = req.user;
        const {
            firstName,
            lastName,
            emailId,
            photoUrl,
            gender,
            age,
            skills,
            about,
        } = user;
        res.json({
            message: "Profile fetched successfully",
            data: {
                firstName,
                lastName,
                emailId,
                photoUrl,
                gender,
                age,
                skills,
                about,
            },
        });
    } catch (err) {
        return res.status(500).send("Error fetching profile");
    }
};

// Edit profile api - POST /profile/edit - edit the profile of logged in user
exports.updateProfile = async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user; // Obtained from userAuth middleware

        // 2. Map the updates directly to the user object
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        // Handle photo upload if a new photo is provided
        if (req.file) {
            loggedInUser.photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        // 3. Save the document (triggers schema validations)
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile was updated successfully`,
            data: loggedInUser,
        });
    } catch (err) {
        console.log("Profile Update Error:", err.message);
        res.status(500).send("PROFILE_UPDATE_ERROR: " + err.message);
    }
};

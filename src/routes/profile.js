const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const {validateEditProfileData} = require("../utils/validation")

const router = express.Router();

// Profile api - GET /profile - get the profile of the logged in user
router.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        return res.status(500).send("Error fetching profile");
    }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateEditProfileData(req)) {
            throw new Error("Invalid Edit Request");
        } 

        const loggedInUser = req.user; // Obtained from userAuth middleware

        // 2. Map the updates directly to the user object
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        // 3. Save the document (triggers schema validations)
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile was updated successfully`,
            data: loggedInUser
        });
        
    } catch(err) {
        res.status(500).send("Error in profile update: " + err.message)
    }
})

module.exports = router;

// // delete user api - DELETE /user/:id - delete a user by id
// router.delete("/user/:userId", async (req, res) => {
//     const userId = req.params.userId;
//     try {
//         const user = await User.findByIdAndDelete(userId);
//         if (!user) {
//             return res.status(404).send("User Not Found");
//         }
//         res.send("User deleted successfully");
//     } catch (err) {
//         return res.status(500).send("Error deleting user");
//     }
// });

// // Update user api - PATCH /user/:id - update a user by id
// router.patch("/user/:userId", async (req, res) => {
//     const userId = req.params.userId;
//     const data = req.body;

//     try {
//         const ALLOWED_UPDATES = [
//             "firstName",
//             "lastName",
//             "password",
//             "age",
//             "gender",
//             "photoUrl",
//             "skills",
//             "about",
//         ];
//         const udates = Object.keys(data);
//         const isValidOperation = udates.every((update) =>
//             ALLOWED_UPDATES.includes(update),
//         );
//         const shouldNotUpdateFields = udates
//             .filter((update) => !ALLOWED_UPDATES.includes(update))
//             .join(", ");

//         if (!isValidOperation) {
//             throw new Error(
//                 "Invalid Updates! You can't update " + shouldNotUpdateFields,
//             );
//         }

//         //validate the number of skills if provided
//         if (data.skills && data.skills.length > 10) {
//             throw new Error("You can't add more than 10 skills");
//         }

//         const user = await User.findByIdAndUpdate(userId, req.body, {
//             returnDocument: "after",
//             runValidators: true,
//         });
//         if (!user) {
//             return res.status(404).send("User Not Found");
//         }
//         res.send("User updated successfully");
//     } catch (err) {
//         return res.status(500).send("UPDATE_FAILED: " + err.message);
//     }
// });
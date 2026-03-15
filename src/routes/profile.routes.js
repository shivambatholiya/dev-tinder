const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { updateProfile, viewProfile } = require("../controllers/profile.controller");
const multer = require("../middlewares/multer");

const router = express.Router();

// Profile api - GET /profile - get the profile of the logged in user
router.get("/profile/view", userAuth, viewProfile);

// Edit Profile api - PATCH /profile/edit - edit the profile of the logged in user
router.patch("/profile/edit", userAuth, multer.single("photo"), updateProfile);

module.exports = router;
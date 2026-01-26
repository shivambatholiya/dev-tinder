const express = require("express");
const User = require("../models/user");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");

// sendConnection api - POST /connect/:id - connect with a user by id
router.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;
    const username = user.firstName;

    res.send({ message: `Connection request sent from ${username}` });
});

module.exports = router;
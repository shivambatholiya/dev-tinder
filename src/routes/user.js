const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Fetch all connection requests sent to the logged-in user with status 'interested'
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', 'firstName lastName emailId photoUrl');

        res.json({
            message: "Connection requests fetched successfully",
            data: connectionRequests
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

router.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Fetch all accepted connection requests involving the logged-in user
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: 'accepted' },
                { toUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate('fromUserId toUserId', 'firstName lastName emailId photoUrl');

        // Extract the connected users
        const data = connections.map((request) => {
            if(request.fromUserId._id.equals(loggedInUser._id)) {
                return request.toUserId;
            } else {
                return request.fromUserId;
            }
        });

        res.json({
            message: "Connections fetched successfully",
            data: data
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

module.exports = router;
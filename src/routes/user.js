const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Fetch all connection requests sent to the logged-in user with status 'interested'
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', 'firstName lastName photoUrl');

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
        }).populate('fromUserId toUserId', 'firstName lastName photoUrl');

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

router.get("/user/feed", userAuth, async (req, res) => {
    try {
        const {page = 1, limit = 10} = req.query;
        const skip = (page - 1) * limit;
        
        const loggedInUser = req.user;

        // Fetch users who have sent or received connection requests with the logged-in user
        const connectedUsers = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id},
                { toUserId: loggedInUser._id}
            ]
        }).select('fromUserId toUserId -_id');

        // Create a set of user IDs to exclude (connected users and self)
        const excludeUserIds = new Set();

        connectedUsers.forEach(connection => {
            excludeUserIds.add(connection.fromUserId.toString());
            excludeUserIds.add(connection.toUserId.toString());
        });

        // get the feed users excluding connected users and self
        const feedUsers = await User.find({
            $and: [
                {_id: {$ne: loggedInUser._id}},
                {_id: {$nin: Array.from(excludeUserIds)}}
            ]
        })
        .select('firstName lastName photoUrl skills')
        .skip(parseInt(skip))
        .limit(parseInt(limit));

        res.json({
            message: "User feed fetched successfully",
            data: feedUsers
        });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
})

module.exports = router;
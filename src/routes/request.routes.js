const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateConnectionRequestData } = require("../utils/validation");


// sendConnection api - POST /connect/:id - connect with a user by id
router.post("/request/send/:status/:userId", userAuth, async (req, res) => {
    try {
        // Validate connection request data
        validateConnectionRequestData(req);

        const user = req.user;
        const { status, userId } = req.params;

        const fromUserId = user._id;
        const toUserId = userId;

        //Check if toUser exists
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            throw new Error("The user you are trying to connect to does not exist");
        };

        // Check if a connection request already exists between the two users
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if(existingRequest) {
            throw new Error("A connection request already exists between these users");
        };

        // Create a new connection request
        const newConnectionRequest = new ConnectionRequest({
            fromUserId: fromUserId,
            toUserId: toUserId,
            status: status
        });

        // Save the connection request to the database
        await newConnectionRequest.save();

        res.json({
            message: status === 'interested' ? `Connection request sent to ${toUser.firstName}` : "Connection request ignored",
            data: newConnectionRequest
        })
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

router.post("/request/review/:status/:requestId", userAuth, async (req, res)  => {
    try {
        const loggedInUser = req.user;
        //validate request data
        const allowedStatus = ['accepted', 'rejected'];
        const { status, requestId } = req.params;

        if (!allowedStatus.includes(status)) {
            throw new Error("Invalid status for reviewing connection request");
        }

        // Check if the connection request exists, and belongs to the logged-in user and is in 'interested' status
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: 'interested'
        });
        if (!connectionRequest) {
            throw new Error("Connection request not found");
        }

        // Update the status of the connection request
        connectionRequest.status = status;
        await connectionRequest.save();

        res.json({
            message: `Connection request ${status} successfully`,
            data: connectionRequest
        })
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

module.exports = router;
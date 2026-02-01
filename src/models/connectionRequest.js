const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['interested', 'ignored'],
            message: '{VALUE} is not a valid status'
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Prevent a user from sending a connection request to themselves
connectionRequestSchema.pre('save', function (next) {
    const connectionRequest = this;

    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        return next(new Error("A user cannot send a connection request to themselves"));
    }
});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;
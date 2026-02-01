const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Define the User schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30,
    },
    lastName: {
        type: String,
        maxlength: 30,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email format");
            }
        },
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        lowercase: true,
        enum: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type`
    },
    photoUrl: {
        type: String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid URL format for photoUrl");
            }
        },
    },
    skills: {
        type: [String],
    },
    about: {
        type: String,
        maxlength: 500,
        default: "Default description about the user.",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Instance method to validate password
userSchema.methods.validatePassword = async function (password) {
    const passwordHash = this.password;
    return await bcrypt.compare(password, passwordHash);
};

// Instance method to generate JWT
userSchema.methods.getJWT = function () {
    const token = jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    return token;
};

// Create the User model using the schema
const User = mongoose.model("User", userSchema);

// Export the User model
module.exports = User;

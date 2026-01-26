const express = require("express");
const { userAuth } = require("./middlewares/auth");
const User = require("./models/user");
const {validateSignupData} = require("./utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");

const app = express();
app.use(cookieParser());

app.use(express.json());

app.post("/signup", async (req, res) => {
    try {
        // validate the signup data
        validateSignupData(req);

        // Signup logic here
        const { firstName, lastName, emailId, password} = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword
        });

        await user.save();
    } catch (err) {
        return res.status(500).send("Error signing up user: " + err.message);
    }
    res.send("User signed up");
});


// Login api - POST /login - login a user
app.post("/login", async (req, res) => {
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
        
        res.send("User logged in successfully");
    } catch (err) {
        return res.status(500).send("LOGIN_FAILED: " + err.message);
    }
    
})

// Profile api - GET /profile - get the profile of the logged in user
app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        return res.status(500).send("Error fetching profile");
    }
})

// sendConnection api - POST /connect/:id - connect with a user by id
app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;
    const username = user.firstName;

    res.send({ message: `Connection request sent from ${username}` });
});

// Feed api - GET/feed - get all the users from the database
app.get("/feed", async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const users = await User.find({ emailId: userEmail });
        if (users.length === 0) {
            res.status(404).send("User Not Found");
        }
        res.send(users);
    } catch (err) {
        return res.status(500).send("Error fetching user");
    }
});

// delete user api - DELETE /user/:id - delete a user by id
app.delete("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send("User Not Found");
        }
        res.send("User deleted successfully");
    } catch (err) {
        return res.status(500).send("Error deleting user");
    }
});

// Update user api - PATCH /user/:id - update a user by id
app.patch("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const data = req.body;

    try {
        const ALLOWED_UPDATES = [
            "firstName",
            "lastName",
            "password",
            "age",
            "gender",
            "photoUrl",
            "skills",
            "about",
        ];
        const udates = Object.keys(data);
        const isValidOperation = udates.every((update) =>
            ALLOWED_UPDATES.includes(update),
        );
        const shouldNotUpdateFields = udates
            .filter((update) => !ALLOWED_UPDATES.includes(update))
            .join(", ");

        if (!isValidOperation) {
            throw new Error(
                "Invalid Updates! You can't update " + shouldNotUpdateFields,
            );
        }

        //validate the number of skills if provided
        if (data.skills && data.skills.length > 10) {
            throw new Error("You can't add more than 10 skills");
        }

        const user = await User.findByIdAndUpdate(userId, req.body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!user) {
            return res.status(404).send("User Not Found");
        }
        res.send("User updated successfully");
    } catch (err) {
        return res.status(500).send("UPDATE_FAILED: " + err.message);
    }
});

// Connect to MongoDB and start the server
connectDB()
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(7777, () => {
            console.log("Server is running on http://localhost:7777");
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

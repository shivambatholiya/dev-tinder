const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("../src/routes/auth")
const profileRouter = require("../src/routes/profile")
const requestRouter = require("../src/routes/request")
const connectDB = require("./config/database");

//create express app
const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

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

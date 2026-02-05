const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("../src/routes/auth")
const profileRouter = require("../src/routes/profile")
const requestRouter = require("../src/routes/request")
const userRouter = require("../src/routes/user")
const connectDB = require("./config/database");
const cors = require("cors");
const morgan = require("morgan");

//create express app
const app = express();

// Use 'dev' format for clean, colored logs in terminal
app.use(morgan("dev"));

// Configure CORS
app.use(cors({
    origin: "http://localhost:5173", // Allow only your frontend
    credentials: true,                // Allow cookies (if needed for devTinder)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());
app.use(express.json());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

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

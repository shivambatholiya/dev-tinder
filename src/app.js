const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes")
const profileRouter = require("./routes/profile.routes")
const requestRouter = require("./routes/request.routes")
const userRouter = require("./routes/user.routes")
const connectDB = require("./config/database");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

//create express app
const app = express();

// Use morgan for logging HTTP requests in development mode
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
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

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

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the cors package
const userRoutes = require("./src/routes/userRoute"); // Import the user routes
const fitnessRoutes = require("./src/routes/fitnessRoute");
const motivRoutes = require("./src/routes/motivRoute");
const bonusRoutes = require("./src/routes/bonusRouter");
const exerciseRoutes = require("./src/routes/exerciseRouter");
const calibrationRoutes = require("./src/routes/calibrationRouter");
const path = require("path");

//firebase
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./ergzz-e62ab-firebase-adminsdk-1tzgk-1da86e42eb.json");

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// CORS middleware setup
app.use(
  cors({
    origin: "*", // Allow all origins, you can specify a specific domain here if needed
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

// user routes
app.use("/users", userRoutes);
// Fitness routes
app.use("/users/fitness", fitnessRoutes);
// Motivational messages routes
app.use("/motivational-messages", motivRoutes);
//Bonus routes
app.use("/bonus", bonusRoutes);
// Health check endpoint
app.get("/", (req, res) => {
  res.send("Server is running");
});
// exercise routes
app.use("/exercise", exerciseRoutes);
//calibration routes
app.use("/user/calibration", calibrationRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

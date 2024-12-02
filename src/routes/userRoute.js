// routes/userRoute.js
const express = require("express");
const userController = require("../controllers/userController"); // Import the controller
const { isAdminMiddleware } = require("../middleware/isAdminMiddleware");
const calibrationController = require("../controllers/calibrationController");
const {
  verifyTokenMiddleware,
} = require("../middleware/verifyTokenMiddleware");

const router = express.Router();
const multer = require("multer");
const path = require("path");

//storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log('req: ', req)
    cb(null, "./public"); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename
  },
});
const upload = multer({ storage });

router.get("/getAllUsers", isAdminMiddleware, userController.getAllUsers); // Route for getting all users
router.get(
  "/perticularuser",
  verifyTokenMiddleware,
  userController.getUserById
); // Route for getting a user by ID
router.post("/createuser", isAdminMiddleware, userController.createUser); // Route for creating a new user
router.put("/update", verifyTokenMiddleware, userController.updateUser); // Route for updating a user
router.delete("/deleteuser", isAdminMiddleware, userController.deleteUser); // Route for deleting a user
router.post("/register", userController.createUser); // Route for creating a new user
router.post("/login", userController.loginUser); // Route for creating a new user
router.post("/blockunblock", isAdminMiddleware, userController.changeStatus); // Route for deleting a user
router.post(
  "/sendOTP",
  isAdminMiddleware,
  userController.sendEmailforGetPassword
); // Route for deleting a user
router.post(
  "/sendnotification",
  isAdminMiddleware,
  upload.single("imageUrl"),
  userController.sendNotification
); // Route for deleting a user

router.get(
  "/getAllNotification",
  isAdminMiddleware,
  userController.getAllNotifications
); // Route for deleting a user

module.exports = router; // Export the router

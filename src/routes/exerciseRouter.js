// routes/userRoute.js
const express = require("express");
const exerciseController = require("../controllers/exerciseController"); // Import the controller
const { isAdminMiddleware } = require("../middleware/isAdminMiddleware");
const {
  verifyTokenMiddleware,
} = require("../middleware/verifyTokenMiddleware");
const multer = require("multer");

const router = express.Router();
const path = require("path");

//storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename
  },
});
const upload = multer({ storage });

// Route for getting all users
router.get(
  "/getAllExericeses",
  verifyTokenMiddleware,
  exerciseController.getAllExercises
);

router.post(
  "/createExercise",
  upload.single("image"),
  isAdminMiddleware,
  exerciseController.createExercise
); // Route for creating a new user

router.patch(
  "/updateExercise",
  isAdminMiddleware,
  upload.single("image"),
  exerciseController.updateExercise
);

router.patch("/reorderExercise", exerciseController.reorderExercises);

router.delete(
  "/deleteExercise",
  isAdminMiddleware,
  exerciseController.deleteExercise
); // Route for deleting a user

module.exports = router; // Export the router

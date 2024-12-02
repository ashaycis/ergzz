// routes/fitnessRoute.js
const express = require("express");
const fitnessController = require("../controllers/fitnessController"); // Import the controller
const {
  verifyTokenMiddleware,
} = require("../middleware/verifyTokenMiddleware");

const router = express.Router();

router.post(
  "/getdetails",
  verifyTokenMiddleware,
  fitnessController.getFitnessRecord
);

router.post(
  "/createdetails",
  verifyTokenMiddleware,
  fitnessController.createFitnessRecord
); // Route for creating a new fitness

router.put(
  "/updatedetails",
  verifyTokenMiddleware,
  fitnessController.updateUser
); // Route for updating a fitness

module.exports = router;

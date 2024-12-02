// routes/fitnessRoute.js
const express = require("express");
const calibrationController = require("../controllers/calibrationController");
const {
  verifyTokenMiddleware,
} = require("../middleware/verifyTokenMiddleware");

const router = express.Router();

router.post(
  "/addcalibration",
  verifyTokenMiddleware,
  calibrationController.calibrateFromDevice
); // Route for updating a fitness
router.post(
  "/getcalibrationDetails",
  verifyTokenMiddleware,
  calibrationController.giveCalibrationData
); // Route for updating a fitness

module.exports = router;

const calibrationModel = require("../models/calibration"); // Import calibration model
const User = require("../models/userModal"); // Import user model
const dataMissing = require("../middleware/detailMissing"); // Import dataMissing function
const { v4: uuidv4 } = require("uuid"); // For generating UUID for cal_id
const BonusPoints = require("../models/bonusModel");

// Controller for creating calibration data
const calibrateFromDevice = async (req, res) => {
  const { user_id, cal_value } = req.body;
  console.log("user_id, cal_value: ", user_id, cal_value);

  // Validate the required fields
  const requiredFields = ["user_id"];
  const missingMessage = dataMissing(requiredFields, { user_id });
  if (missingMessage) {
    return res.status(400).json({ error: missingMessage });
  }
  if (cal_value === "") {
    return res.status(400).json({ error: "Calibration Value is missing" });
  }

  try {
    // Verify that the user exists
    const userExists = await User.findOne({ where: { user_id } });
    if (!userExists) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Use current UNIX timestamp for created_at
    const created_at = Math.floor(Date.now());

    // Create a new calibration record using Sequelize
    await calibrationModel.create({
      user_id,
      cal_value,
      created_at,
    });

    // get bonus points
    const bonusDetails = await BonusPoints.findOne({
      where: { user_id: user_id },
    });
    // Update the existing bonus points record
    await BonusPoints.update(
      {
        bonusPoints: bonusDetails.bonusPoints + 1,
        update_at: new Date(), // Set the current date and time
      },
      {
        where: { user_id: user_id },
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Calibration data added and 1 bonus point earned successfully",
    });
  } catch (err) {
    console.error("Error in calibration creation:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Controller for retrieving calibration data for a specific user
const giveCalibrationData = async (req, res) => {
  const { user_id } = req.body;

  try {
    // Verify that the user exists
    const userExists = await User.findOne({ where: { user_id } });
    if (!userExists) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Retrieve calibration data for the user using Sequelize
    const calibrationData = await calibrationModel.findAll({
      where: { user_id },
      attributes: { exclude: ["user_id"] }, // Exclude the user_id from the result
      order: [["created_at", "DESC"]], // Sort by most recent calibration data
    });

    if (!calibrationData || calibrationData.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No calibration data found for this user",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Calibration data retrieved successfully",
      data: calibrationData,
    });
  } catch (err) {
    console.error("Error retrieving calibration data:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = { calibrateFromDevice, giveCalibrationData };

const BonusPoints = require("../models/bonusModel"); // Import bonus model
const User = require("../models/userModal"); // Import user model
const dataMissing = require("../middleware/detailMissing"); // Import dataMissing function
const BonusConfig = require("../models/bonusConfig");

const updateBonus = async (req, res) => {
  const { bonusPoints, userID, operation } = req.body; // Destructure bonusPoints, userID, and operation from req.body
  const requiredFields = ["bonusPoints", "userID", "operation"];
  const missingMessage = dataMissing(requiredFields, {
    bonusPoints,
    userID,
    operation,
  });
  if (missingMessage) {
    return res.status(400).json({ error: missingMessage });
  }

  // Validate the operation
  if (operation !== "increase" && operation !== "decrease") {
    return res
      .status(400)
      .json({ error: "Invalid operation. Use 'increase' or 'decrease'." });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({
      where: { user_id: userID },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve existing bonus points
    const existingBonus = await BonusPoints.findOne({
      where: { user_id: userID },
    });

    if (existingBonus) {
      // Calculate new bonus points based on the operation
      let updatedBonusPoints =
        operation === "increase"
          ? existingBonus.bonusPoints + bonusPoints
          : existingBonus.bonusPoints - bonusPoints;

      // Ensure bonus points don't go below zero
      if (updatedBonusPoints < 0) {
        updatedBonusPoints = 0;
      }

      // Update the existing bonus points record
      await BonusPoints.update(
        {
          bonusPoints: updatedBonusPoints,
          update_at: new Date(), // Set the current date and time
        },
        {
          where: { user_id: userID },
        }
      );

      // Return success response
      res.status(200).json({
        message: "Bonus points updated successfully",
        updatedRecord: {
          user_id: userID,
          bonusPoints: updatedBonusPoints,
        },
      });
    } else {
      // Handle case where no bonus points record exists for the user
      res
        .status(404)
        .json({ error: "Bonus points record not found for the user" });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating bonus points" });
  }
};

const getBonusDetails = async (req, res) => {
  const { userID } = req.body; // Extract userID from req.params
  console.log("userID: in bonus details", userID);

  // Check if userID is provided
  if (!userID) {
    return res.status(400).json({ error: "Missing userID parameter" });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({
      where: { user_id: userID },
    });

    if (!user) {
      return res.status(404).json({ status: 404, error: "User not found" });
    }

    // Retrieve the user's bonus points
    const bonusDetails = await BonusPoints.findOne({
      where: { user_id: userID },
    });

    if (bonusDetails) {
      // Return the bonus points details
      return res.status(200).json({
        status: 200,
        message: "Bonus points retrieved successfully",
        data: {
          user_id: userID,
          bonusPoints: bonusDetails.bonusPoints,
          lastUpdated: bonusDetails.update_at,
        },
      });
    } else {
      // Handle case where no bonus points record exists for the user
      return res.status(404).json({
        status: 404,
        error: "Bonus points record not found for the user",
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving bonus points" });
  }
};

const getAllBonusDetail = async (req, res) => {
  try {
    // Fetch all bonus configurations from the database
    const bonusDetails = await BonusConfig.findAll();

    console.log("bonusDetails: ", bonusDetails);
    return res.status(200).json({
      status: 200,
      message: "Bonus Configurations successfully",
      data: bonusDetails,
    });
  } catch (error) {
    // Handle any errors that occur
    console.error("Error fetching bonus details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bonus details.",
      error: error.message,
    });
  }
};

const updateBonusDetails = async (req, res) => {
  try {
    const { head_id, values } = req.body;

    // Find the bonus configuration by head_id
    let bonusConfig = await BonusConfig.findOne({
      where: { head_id },
    });

    if (bonusConfig) {
      // Update the existing record's values and heading
      bonusConfig.values = values;
      await bonusConfig.save();

      return res.status(200).json({
        status: 200,
        message: "Bonus configuration updated successfully",
        data: bonusConfig,
      });
    } else {
      // Create a new bonus configuration if it does not exist
      const newBonusConfig = await BonusConfig.create({
        head_id,
        values,
        created_at: new Date(),
      });

      return res.status(201).json({
        status: 201,
        message: "Bonus configuration created successfully",
        data: newBonusConfig,
      });
    }
  } catch (error) {
    // Handle any errors that occur
    console.error("Error updating/creating bonus configuration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update or create bonus configuration.",
      error: error.message,
    });
  }
};

module.exports = {
  updateBonus,
  getBonusDetails,
  getAllBonusDetail,
  updateBonusDetails,
};

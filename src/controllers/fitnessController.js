const dataMissing = require("../middleware/detailMissing");
const { responseGenerator } = require("../middleware/responseMiddleware");
const BonusPoints = require("../models/bonusModel");
const fitnessTrackerModel = require("../models/fitnessTrackerModal"); // Import user model

const getFitnessRecord = async (req, res) => {
  const { user_id } = req.body; // Assuming you're passing the user_id as part of the request body
  const userData = req.body; // Assign the entire request body to userData for validation
  const requiredFields = ["user_id"];
  const missingMessage = dataMissing(requiredFields, userData);

  // Check for missing fields
  if (missingMessage) {
    return res.status(400).json(responseGenerator(400, null, missingMessage));
  }

  try {
    // Find the fitness record based on user_id
    const fitnessRecord = await fitnessTrackerModel.findOne({
      where: { user_id },
    });

    // If no record is found, respond with 404
    if (!fitnessRecord) {
      return res
        .status(404)
        .json(responseGenerator(404, null, "Fitness record not found"));
    }

    // Retrieve the user's bonus points
    const bonusDetails = await BonusPoints.findOne({
      where: { user_id: user_id },
    });
    console.log("bonus Points: ", bonusDetails?.dataValues?.bonusPoints);
    // fitnessRecord.add(...prev, bonusDetails?.dataValues?.bonusPoints);
    fitnessRecord.dataValues.bonusPoints =
      bonusDetails?.dataValues?.bonusPoints;
    // Respond with the fitness record
    return res
      .status(200)
      .json(
        responseGenerator(
          200,
          fitnessRecord,
          "Fitness record fetched successfully"
        )
      );
  } catch (error) {
    // Log and respond with the error
    console.error("Error fetching fitness record:", error);
    return res
      .status(500)
      .json(responseGenerator(500, null, "Failed to fetch fitness record"));
  }
};

const createFitnessRecord = async (req, res) => {
  const { user_id, unit, height, weight, gender, age, avg_steps } = req.body;

  const requiredFields = [
    "user_id",
    "unit",
    "height",
    "weight",
    "gender",
    "age",
    "avg_steps",
  ];

  const missingMessage = dataMissing(requiredFields, req.body);

  if (missingMessage) {
    return res.status(400).json({ error: missingMessage });
  }

  // Validate specific fields
  if (typeof height !== "number" || height <= 0) {
    return res.status(400).json({ error: "Invalid height value" });
  }
  if (typeof weight !== "number" || weight <= 0) {
    return res.status(400).json({ error: "Invalid weight value" });
  }
  if (typeof age !== "number" || age <= 0) {
    return res.status(400).json({ error: "Invalid age value" });
  }
  if (typeof avg_steps !== "number" || avg_steps < 0) {
    return res.status(400).json({ error: "Invalid avg_steps value" });
  }

  try {
    // Ensure the user exists before creating a fitness record
    const userExists = await User.findOne({ where: { user_id } });
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the fitness record in the database
    const newRecord = await fitnessTrackerModel.create({
      user_id,
      unit,
      height,
      weight,
      gender,
      age,
      avg_steps,
    });

    // Respond with the created record
    res.status(201).json(newRecord);
  } catch (error) {
    // Log and respond with the error
    console.error("Error creating fitness record:", error.message || error);
    res.status(500).json({ error: "Failed to create fitness record" });
  }
};

const updateUser = async (req, res) => {
  const { user_id, unit, height, weight, gender, age, avg_steps } = req.body;

  const requiredFields = [
    "user_id",
    "unit",
    "height",
    "weight",
    "gender",
    "age",
    "avg_steps",
  ];

  // Check for missing fields
  const missingMessage = dataMissing(requiredFields, req.body);
  if (missingMessage) {
    return res.status(400).json(responseGenerator(400, null, missingMessage));
  }

  try {
    // Find the fitness record by user_id and update
    const [updated] = await fitnessTrackerModel.update(
      {
        unit,
        height,
        weight,
        gender,
        age,
        avg_steps,
      },
      {
        where: { user_id },
      }
    );

    // If no records were updated, send a 404 response
    if (!updated) {
      return res
        .status(404)
        .json(responseGenerator(404, null, "Fitness record not found"));
    }

    // Fetch the updated record
    const updatedFitnessRecord = await fitnessTrackerModel.findOne({
      where: { user_id },
    });

    // Send back the updated record
    return res
      .status(200)
      .json(
        responseGenerator(
          200,
          updatedFitnessRecord,
          "Fitness record updated successfully"
        )
      );
  } catch (err) {
    // Handle errors
    console.error("Error updating fitness record:", err);
    return res
      .status(500)
      .json(responseGenerator(500, null, "Failed to update fitness record"));
  }
};

module.exports = { createFitnessRecord, updateUser, getFitnessRecord };

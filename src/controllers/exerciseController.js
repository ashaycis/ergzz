const dataMissing = require("../middleware/detailMissing");
const { responseGenerator } = require("../middleware/responseMiddleware");
const Exercise = require("../models/exerciseModal"); // Adjust the path as needed for your Exercise model

const baseUrl = process.env.BASEURL;

// Get all exercises
const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.findAll({
      order: [["order_number", "ASC"]], // Order by order_number
    });

    const updatedExercises = exercises.map((exercise) => {
      return {
        exer_id: exercise.exer_id, // Explicitly include the exercise ID
        ...exercise.dataValues, // Include other exercise fields
        image_url: `${exercise.image_url}`, // Modify image_url if needed
      };
    });

    // Respond with the fetched exercises
    return res
      .status(200)
      .json(
        responseGenerator(
          200,
          updatedExercises,
          "Exercises fetched successfully"
        )
      );
  } catch (err) {
    console.error(err);
    // Respond with an error message
    return res.status(500).json(responseGenerator(500, null, err.message));
  }
};
// Create a new exercise
const createExercise = async (req, res) => {
  try {
    console.log("req.file: ", req.file);
    const { heading, description } = req.body;

    const requiredFields = ["heading", "description"];

    const missingMessage = dataMissing(requiredFields, req.body);

    if (missingMessage) {
      return res.status(400).json({ error: missingMessage });
    }

    const image_url = `${req.file.filename}`; // Relative path to the uploaded image

    // Find the current highest order_number and increment it for the new exercise
    const maxOrder = (await Exercise.max("order_number")) || 0;
    const order_number = maxOrder + 1;

    const newExercise = await Exercise.create({
      image_url,
      heading,
      description,
      order_number, // Assign a new order number
    });

    res.status(200).json({
      status: 200,
      message: "Exercise added successfully",
      exercise: newExercise,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
// Update an existing exercise
const updateExercise = async (req, res) => {
  try {
    const { exer_id, heading, description, isActive, order_number } = req.body;
    const image_url = req.file ? `${req.file.filename}` : null; // New image if uploaded

    console.log(
      "exer_id, image_url, heading, description, isActive, order_number: ",
      exer_id,
      image_url,
      heading,
      description,
      isActive,
      order_number
    );

    // Validate that exer_id is provided
    if (!exer_id) {
      return res.status(400).json({ error: "exer_id is required." });
    }

    // Check existing exercise
    const existingExercise = await Exercise.findOne({ where: { exer_id } });
    if (!existingExercise) {
      return res
        .status(404)
        .json({ status: "error", message: "Exercise not found" });
    }
    console.log("Existing Exercise: ", existingExercise);

    // Prepare update data conditionally
    const updateData = {};

    // Update image_url if a new one is uploaded or if different
    if (image_url && image_url !== existingExercise.image_url) {
      updateData.image_url = image_url; // Save complete URL including baseUrl
    }

    // Update other fields if they are provided or different
    if (heading && heading !== existingExercise.heading) {
      updateData.heading = heading;
    }
    if (description && description !== existingExercise.description) {
      updateData.description = description;
    }
    if (isActive !== undefined && isActive !== existingExercise.isActive) {
      updateData.isActive = isActive;
    }
    if (
      order_number !== undefined &&
      order_number !== existingExercise.order_number
    ) {
      updateData.order_number = order_number;
    }

    console.log("Update Data: ", updateData);

    // Update the exercise and handle updatedAt automatically
    const [updated] = await Exercise.update(updateData, { where: { exer_id } });
    console.log("updated: ", updated);

    // Fetch the updated exercise
    const updatedExercise = await Exercise.findOne({ where: { exer_id } });

    if (updated) {
      return res.json({
        status: 200,
        message: "Exercise updated successfully",
        data: updatedExercise,
      });
    } else {
      return res.json({
        status: 200,
        message: "Found nothing to update",
        data: updatedExercise,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};
// Delete an existing exercise
const deleteExercise = async (req, res) => {
  try {
    const { exer_id } = req.body;
    const deleted = await Exercise.destroy({ where: { exer_id } });
    if (deleted) {
      // Optionally reassign order_numbers to remaining exercises
      await reassignOrderNumbers();
      res.json({
        status: 200,
        message: "Exercise deleted successfully",
      });
    } else {
      res.status(404).json({ status: "error", message: "Exercise not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
// Optional: Function to reorder remaining exercises after deletion
const reassignOrderNumbers = async () => {
  const exercises = await Exercise.findAll({
    order: [["order_number", "ASC"]],
  });
  let newOrder = 1;
  for (const exercise of exercises) {
    await exercise.update({ order_number: newOrder });
    newOrder++;
  }
};
// Reodder the exercise
const reorderExercises = async (req, res) => {
  try {
    const { exerciseData } = req.body; // Expecting an array of { exer_id, order_number }
    console.log("Reordered Exercises: ", exerciseData);
    // Validae that the request body contains reordered exercises
    if (!Array.isArray(exerciseData) || exerciseData.length === 0) {
      return res.status(400).json({ error: "exerciseData array is required." });
    }
    // Loop through each exercise and update its order number
    const updatePromises = exerciseData.map(async (exercise) => {
      const { exer_id, order_number } = exercise;
      // Validate that both exer_id and order_number are provided
      if (typeof exer_id !== "number" || typeof order_number !== "number") {
        throw new Error(
          "Each exercise must have a valid exer_id and order_number."
        );
      }
      // Update each exercise with its new order number
      return Exercise.update({ order_number }, { where: { exer_id } });
    });
    // Execute all updates in parallel
    await Promise.all(updatePromises);
    // Optionally fetch the updated list of exercises sorted by order_number
    const updatedExercises = await Exercise.findAll({
      order: [["order_number", "ASC"]],
    });
    return res.json({
      status: 200,
      message: "Exercises reordered successfully",
      data: updatedExercises,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

module.exports = {
  getAllExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  reorderExercises,
};

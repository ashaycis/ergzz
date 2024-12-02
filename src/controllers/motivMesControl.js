const MotivMess = require("../models/motivMessModel"); // Import motivational message model
const dataMissing = require("../middleware/detailMissing");
const { responseGenerator } = require("../middleware/responseMiddleware");

// Create a motivational message
const createMotivMessage = async (req, res) => {
  try {
    const userData = req.body;

    // Define the required fields
    const requiredFields = ["messContent"];

    // Check for missing fields
    const missingMessage = dataMissing(requiredFields, userData);
    if (missingMessage) {
      return res.status(400).json(responseGenerator(400, null, missingMessage));
    }

    // Destructure the required data
    const { messContent } = userData;

    // Create the motivational message using Sequelize
    const newMessage = await MotivMess.create({
      messContent,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send a 201 status with the created message
    return res
      .status(200)
      .json(responseGenerator(200, newMessage, "Message created successfully"));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(responseGenerator(500, null, "Internal server error"));
  }
};

// Update a motivational message
const updateMotivMessage = async (req, res) => {
  try {
    const { messId, messContent } = req.body; // Destructure messId and messContent

    // Define the required fields
    const requiredFields = ["messContent"];

    // Check for missing fields
    const missingMessage = dataMissing(requiredFields, { messContent });
    if (missingMessage) {
      return res.status(400).json(responseGenerator(400, null, missingMessage));
    }

    // Update the motivational message
    const [updatedRows] = await MotivMess.update(
      {
        messContent,
        updated_at: new Date(), // Update the timestamp
      },
      {
        where: { mess_id: messId }, // Use the provided messId
      }
    );

    // Check if any rows were updated
    if (updatedRows === 0) {
      return res
        .status(404)
        .json(
          responseGenerator(
            404,
            null,
            "No record found with the provided mess_id"
          )
        );
    }

    // Retrieve the updated record
    const updatedRecord = await MotivMess.findOne({
      where: { mess_id: messId },
    });

    // Send success response with the updated record
    return res
      .status(200)
      .json(
        responseGenerator(200, updatedRecord, "Message updated successfully")
      );
  } catch (err) {
    console.error(err);
    return res.status(500).json(responseGenerator(500, err.message)); // Send 500 for server errors
  }
};

// Delete a motivational message
const deleteMotivMessage = async (req, res) => {
  try {
    const { messId } = req.body; // Extract messId

    // Ensure messId is provided
    if (!messId) {
      return res.status(400).json(responseGenerator(400, "messId is required"));
    }

    // Attempt to delete the message
    const deletedRows = await MotivMess.destroy({
      where: { mess_id: messId },
    });

    // Check if any rows were deleted
    if (deletedRows === 0) {
      return res
        .status(400)
        .json(
          responseGenerator(404, "No record found with the provided messId")
        );
    }

    // Send success response
    const data = {
      mess_id: messId,
      message: "Record deleted successfully",
    };
    return res.status(200).json(responseGenerator(200, data));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(responseGenerator(500, "Internal server error"));
  }
};

// View all motivational messages
const viewAllMotivMessage = async (req, res) => {
  try {
    // Fetch all messages, sorted by created_at in descending order
    const messages = await MotivMess.findAll({
      order: [["created_at", "DESC"]], // Adjust the field name as needed
    });

    // Send the results as a JSON response
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json(responseGenerator(404, err.message));
  }
};

module.exports = {
  createMotivMessage,
  updateMotivMessage,
  deleteMotivMessage,
  viewAllMotivMessage,
};

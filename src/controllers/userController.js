// controllers/userController.js
const userModel = require("../models/userModal"); // Import user model
const db = require("../../config"); // Import the database connection
const dataMissing = require("../middleware/detailMissing");
const users = require("../models/userModal");
const sequelize = require("../../config");
const BonusPoints = require("../models/bonusModel");
const fitnessModal = require("../models/fitnessTrackerModal");
const {
  hashPassword,
  checkPassword,
} = require("../middleware/passwordManupulation");
const { generateToken } = require("../middleware/jwt");
const { responseGenerator } = require("../middleware/responseMiddleware");
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure you set this in your environment variables
const { firebaseAdmin } = require("../../firebaseNoti");
const admin = require("firebase-admin");
const Notification = require("../models/notification"); // Adjust the path as needed for your Notification model

// notification
const fs = require("fs");
const cron = require("node-cron");

const baseUrl = process.env.BASEURL;

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const allUsers = await users.findAll();

    // Filter users to include only those where isAdmin is false
    const nonAdminUsers = allUsers.filter((user) => !user.isAdmin);

    // Use responseGenerator to format the success response
    return res
      .status(200)
      .json(
        responseGenerator(200, nonAdminUsers, "Users fetched successfully")
      );
  } catch (err) {
    console.error(err);

    // Use responseGenerator to format the error response
    return res
      .status(500)
      .json(responseGenerator(500, null, "Failed to fetch users"));
  }
};
// Get a user by ID
const getUserById = async (req, res) => {
  const { userId } = req.body; // Get userId from req.body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch the user from the database
    const user = await users.findOne({
      where: { user_id: userId }, // Adjust this according to your schema
    });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Remove the password field from the user object for security reasons
    const { password, ...userData } = user.toJSON();
    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
// create a user
const createUser = async (req, res) => {
  const userData = req.body;
  const requiredFields = ["name", "profile_url", "email", "uid", "fcm_id"];
  const missingMessage = dataMissing(requiredFields, userData);

  if (missingMessage) {
    return res.status(400).json(responseGenerator(400, null, missingMessage));
  }

  const { name, profile_url, email, uid, fcm_id } = userData;
  const is_blocked = false;

  const transaction = await sequelize.transaction();

  try {
    // Check if the user already exists
    const existingUser = await users.findOne({
      where: { uid }, // Check using UID
    });

    if (existingUser) {
      // Fetch fitness data
      const fitnessRecord = await fitnessModal.findOne({
        where: { user_id: existingUser.user_id },
      });

      let comp_profile = false;
      if (
        fitnessRecord &&
        fitnessRecord.unit &&
        fitnessRecord.avg_steps !== null &&
        fitnessRecord.height !== null &&
        fitnessRecord.weight !== null &&
        fitnessRecord.age !== null &&
        fitnessRecord.gender
      ) {
        comp_profile = true;
      }

      // Update FCM token
      await users.update({ fcm_id }, { where: { uid } });

      const generatedToken = generateToken(existingUser.user_id, email);
      return res.status(200).json(
        responseGenerator(
          200,
          {
            profile_url: existingUser.profile_url,
            uid: existingUser.uid,
            id: existingUser.user_id,
            name: existingUser.name,
            email: existingUser.email,
            is_blocked: existingUser.is_blocked,
            bonusPoints: existingUser.bonusPoints || 0,
            token: generatedToken,
            is_newUser: false,
            comp_profile,
          },
          "User already registered, token returned"
        )
      );
    }

    // Create new user if they don't exist
    const data = {
      name,
      profile_url,
      email,
      uid,
      is_blocked,
      is_admin: 0,
      fcm_id,
    };

    const user = await users.create(data, { transaction });
    const userID = user.user_id;

    // Insert bonus points for the new user
    await BonusPoints.create(
      {
        bonusPoints: 0,
        updated_at: new Date(),
        user_id: userID,
      },
      { transaction }
    );

    // Insert initial fitness details
    const fitnessData = {
      user_id: userID,
      unit: null,
      height: null,
      weight: null,
      gender: null,
      age: null,
      avg_steps: null,
    };

    await fitnessModal.create(fitnessData, { transaction });

    // Commit the transaction
    await transaction.commit();

    // Generate JWT token for the new user
    const generatedToken = generateToken(userID, email);

    return res.status(200).json(
      responseGenerator(
        200,
        {
          profile_url,
          uid,
          id: userID,
          name,
          email,
          is_blocked,
          bonusPoints: 0,
          token: generatedToken,
          is_newUser: true,
          comp_profile: false,
        },
        "User created successfully"
      )
    );
  } catch (err) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error("Transaction rollback due to error:", err);
    return res
      .status(500)
      .json(
        responseGenerator(500, null, "Failed to create user or bonus points")
      );
  }
};
// Update a user by ID
const updateUser = async (req, res) => {
  const { userData, userId, fitnessData } = req.body;
  const dataToCheck = { userData, userId, fitnessData };
  const requiredFields = ["userData", "userId", "fitnessData"];
  const missingMessage = dataMissing(requiredFields, dataToCheck);

  if (missingMessage) {
    return res.status(400).json({ error: missingMessage });
  }

  // Start a transaction to ensure both updates happen atomically
  const transaction = await sequelize.transaction();

  try {
    // Check if the user exists
    const user = await users.findOne({ where: { user_id: userId } });
    console.log("user: ", user);

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User Not Found" });
    }

    // Update the user record in the 'users' table
    await users.update(userData, {
      where: { user_id: userId },
      transaction, // Use the transaction
    });

    // Update the fitness details in the 'fitnessModal' table
    await fitnessModal.update(fitnessData, {
      where: { user_id: userId }, // Assuming fitnessModal has a user_id column
      transaction, // Use the same transaction
    });

    // Commit the transaction
    await transaction.commit();

    // Retrieve the updated user data
    const updatedUser = await users.findOne({ where: { user_id: userId } });

    // Send success response with updated user data
    res.json({
      status: 200,
      message: "User and fitness details updated successfully",
      users: updatedUser,
    });
  } catch (err) {
    console.error(err);

    // Rollback the transaction in case of an error
    await transaction.rollback();
    res.json({
      status: 500,
      message: err.message,
    });
  }
};
// Delete a user by ID
const deleteUser = async (req, res) => {
  // Extract and validate user_id from req.body
  const userId = parseInt(req.body.user_id, 10); // Parsing to integer for better validation
  console.log("userId: in API call", userId);

  // Validation for user_id
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid or missing user_id" });
  }

  const transaction = await sequelize.transaction();

  try {
    // Fetch the user from the database
    const user = await users.findOne({
      where: { user_id: userId },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user from the BonusPoints table
    await BonusPoints.destroy({
      where: { user_id: userId },
      transaction,
    });

    // Delete the user from the users table
    const result = await users.destroy({
      where: { user_id: userId },
      transaction,
    });

    // Check if the user existed and was deleted
    if (result === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    // Commit the transaction if everything is successful
    await transaction.commit();

    return res.json(
      responseGenerator(
        200,
        { user: result }, // Send the updated user data
        "User and related bonus points deleted successfully"
      )
    );
  } catch (err) {
    // Rollback the transaction in case of error, if not already finished
    if (
      transaction.finished !== "commit" &&
      transaction.finished !== "rollback"
    ) {
      await transaction.rollback();
    }
    console.error("Transaction rollback due to error:", err); // Detailed error logging
    return res
      .status(500)
      .json({ error: "An error occurred while deleting user" });
  }
};
const loginUser = async (req, res) => {
  const { email, uid } = req.body;

  // Define required fields
  const requiredFields = ["email", "uid"];
  const userData = { email, uid };

  // Check for missing fields
  const missingMessage = dataMissing(requiredFields, userData);
  if (missingMessage) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: missingMessage,
    });
  }

  try {
    // Fetch user from the database
    const user = await users.findOne({ where: { email } });

    // If no user is found or UID doesn't match, return invalid credentials error
    if (!user || user.uid !== uid) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid Credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.email);

    // Send back success response with user data and token
    return res.status(200).json({
      status: 200,
      data: {
        user: {
          id: user.user_id,
          email: user.email,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal Server Error",
    });
  }
};
const changeStatus = async (req, res) => {
  const { user_id } = req.body;

  // Check if userId is provided
  if (!user_id) {
    return res.status(400).json({ error: "UserId is required" });
  }

  try {
    // Check if the user exists
    const user = await users.findOne({ where: { user_id: user_id } });
    console.log("user: ", user);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Toggle the is_blocked status
    const newStatus = !user.is_blocked; // Flip the current status

    // Update the user's is_blocked status
    const response = await users.update(
      { is_blocked: newStatus }, // Set the new status
      { where: { user_id: user_id } } // Apply update to the correct user
    );

    // Check if the update was successful
    if (response[0] === 0) {
      return res.status(400).json({ error: "Unable to update user status" });
    }

    // Fetch the updated user to return the updated data
    const updatedUser = await users.findOne({ where: { user_id: user_id } });

    // Send success response with the updated user data
    res.json(
      responseGenerator(
        200,
        { user: updatedUser }, // Send the updated user data
        `User ${newStatus ? "blocked" : "activated"} successfully`
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// Set up storage directory for image uploads if needed
const sendNotification = async (req, res) => {
  const { fcmToken, title, body } = req.body;
  const file = req.file; // Assuming file is provided in req.file by multer middleware
  let image_url = "";
  if (file) {
    image_url = req.file.filename; // Store only the filename, not the full URL
  }

  // Parse FCM tokens
  const tokenList = Array.isArray(fcmToken) ? fcmToken : JSON.parse(fcmToken);
  if (!tokenList || tokenList.length === 0) {
    return res.status(400).json({
      status: 400,
      message: "No valid FCM tokens provided",
    });
  }

  const message = {
    notification: {
      title,
      body,
      ...(image_url && { image: `${baseUrl}/${image_url}` }), // Send the full URL when sending the notification
    },
  };

  const responseList = [];

  // Send the notification to each device via Firebase
  for (const token of tokenList) {
    try {
      const response = await firebaseAdmin
        .messaging()
        .send({ ...message, token });
      console.log(`Notification sent to ${token}:`, response);
      responseList.push({ token, response });
    } catch (error) {
      console.error(`Failed to send notification to ${token}:`, error.message);
      return res.status(500).json({
        status: 500,
        message: "Failed to send notification",
        error: `Error for token ${token}: ${error.message}`,
      });
    }
  }

  try {
    // Save the notification to the database
    const notification = await Notification.create({
      title,
      body,
      created_At: new Date(),
      audience: tokenList,
      image_url, // Save the image filename (not the full URL)
    });

    return res.status(200).json({
      status: 200,
      message: `Notifications sent to ${tokenList.length} devices and saved in database`,
      responseList,
      notificationId: notification.notification_id,
    });
  } catch (error) {
    console.error(
      "Failed to save notification to the database:",
      error.message
    );
    return res.status(500).json({
      status: 500,
      message: "Notification sent but failed to save to the database",
      error: error.message,
    });
  }
};
const getAllNotifications = async (req, res) => {
  try {
    // Fetch all notifications in descending order
    console.log("Fetching notifications...");
    const notifications = await Notification.findAll({
      order: [["created_At", "DESC"]],
      raw: true,
    });
    console.log("notifications: 1st", notifications);

    // If there are no notifications, return a custom message
    if (notifications.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No notification found",
      });
    }

    // Extract unique FCM tokens from notifications
    const fcmTokens = [
      ...new Set(
        notifications.flatMap((notification) => notification.audience)
      ),
    ];

    // Fetch users corresponding to the FCM tokens in one query
    const usersList = await users.findAll({
      where: { fcm_id: fcmTokens },
      attributes: ["fcm_id", "name"], // Include fcm_id for mapping
    });

    // Create a mapping of fcm_id to user names
    const usersMap = usersList.reduce((map, user) => {
      map[user.fcm_id] = user.name;
      return map;
    }, {});

    // Map notifications to include audience names
    const notificationsWithNames = notifications.map((notification) => {
      const audienceNames = notification.audience.map(
        (fcmToken) => usersMap[fcmToken] || "Unknown User"
      );

      // Append the full URL for the image in the notification response
      const image_url = notification.image_url
        ? `${baseUrl}/${notification.image_url}`
        : null;

      return {
        ...notification,
        audience: audienceNames, // Replace audience with user names
        image_url, // Add full image URL if exists
      };
    });

    return res.status(200).json({
      status: 200,
      data: notificationsWithNames,
      message: `${notificationsWithNames.length} notifications found`,
    });
  } catch (error) {
    console.error("Error fetching notifications with audience names:", error);
    return res.status(500).json({
      status: 500,
      data: [],
      message: `${error.message}`,
    });
  }
};
//generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
// Send Email to email address
const sendEmailforGetPassword = async (req, res) => {
  const emailId = req.body.emailId;
  if (!emailId) {
    return res.status(400).json({ error: "Missing EmailId" });
  }
  const transaction = await sequelize.transaction();
  try {
    // Fetch the user from the database
    const user = await users.findOne({
      where: { email: emailId },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: "Account not found" });
    } else if (user.isAdmin !== true) {
      await transaction.rollback();
      return res.status(404).json({ error: "No admin account found" });
    }

    // Generate an OTP
    const otp = generateOTP();

    // Send OTP via email (you'll need to replace sendEmail with your actual email sending function)
    await sendEmail({
      to: "ashay.t@cisinlabs.com",
      subject: "Sampel OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    // Commit the transaction if everything is successful
    await transaction.commit();

    return res.json({
      message: "OTP sent to your email address.",
      otp, // For development, remove this in production
    });
  } catch (err) {
    if (
      transaction.finished !== "commit" &&
      transaction.finished !== "rollback"
    ) {
      await transaction.rollback();
    }
    console.error("Transaction rollback due to error:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  sendNotification,
  createUser,
  getAllNotifications,
  updateUser,
  deleteUser,
  loginUser,
  changeStatus,
  sendEmailforGetPassword,
  // sendMultiNotification,
};

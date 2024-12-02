const { DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path as needed for your Sequelize instance

// Define the User model
const User = sequelize.define(
  "User", // Model name should be singular and capitalized
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false, // Ensure it cannot be null
    },
    uid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Generate unique UUID
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_url: {
      type: DataTypes.STRING,
      allowNull: true, // Profile picture URL, optional
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Validate email format
      },
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    comp_profile: {
      type: DataTypes.BOOLEAN, // New field for completed profile
      defaultValue: false, // Set default to false
    },
    fcm_id: {
      type: DataTypes.STRING, // New field for completed profile
      defaultValue: false, // Set default to false
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: "created_at", // Map Sequelize's createdAt to created_at
    updatedAt: "updated_at", // Map Sequelize's updatedAt to updated_at
    tableName: "users", // Specify the table name
  }
);

module.exports = User;

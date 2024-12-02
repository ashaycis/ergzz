const { DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path as needed for your Sequelize instance

// Define the Calibration model
const Calibration = sequelize.define(
  "Calibration", // Model name should be singular and capitalized
  {
    cal_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generates a UUID
      allowNull: false,
      primaryKey: true, // Set as primary key
    },
    created_at: {
      type: DataTypes.STRING,
      allowNull: false, // Cannot be null
      defaultValue: DataTypes.NOW, // Defaults to current timestamp
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Cannot be null
      references: {
        model: "users", // References the 'users' table
        key: "user_id", // Foreign key based on user_id
      },
    },
    cal_value: {
      type: DataTypes.INTEGER,
      allowNull: true, // Optional calibration value
    },
  },
  {
    timestamps: false, // No automatic timestamps since we are defining created_at explicitly
    tableName: "calibration", // Specify the table name
  }
);

module.exports = Calibration;

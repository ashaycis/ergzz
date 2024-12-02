const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path as needed for your Sequelize instance

// Define the Exercise model
const Exercise = sequelize.define(
  "Exercise",
  {
    exer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // Auto-incrementing field
      primaryKey: true, // This field is the primary key
      allowNull: false,
    },
    order_number: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Use this field as the primary key
      allowNull: false,
      unique: true, // Ensure it remains unique
    },
    image_url: {
      type: DataTypes.STRING(255), // Adjust size as needed
      allowNull: true,
    },
    heading: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Default value set to true
    },
  },
  {
    timestamps: false, // No default createdAt and updatedAt fields
    tableName: "exercises", // Specify the table name
  }
);

module.exports = Exercise;

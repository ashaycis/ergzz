const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path as needed for your Sequelize instance

// Define the FitnessDetails model
const FitnessDetails = sequelize.define(
  "FitnessDetails",
  {
    fitness_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // The name of the target table should match the User model's table name
        key: "user_id", // The key in the target table
      },
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    height: {
      type: DataTypes.DECIMAL(5, 2), // Example format for height in centimeters
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2), // Example format for weight in kilograms
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("m", "f", "o"), // Restrict gender to predefined values
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    avg_steps: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      onUpdate: Sequelize.NOW, // Update this field automatically when the record is updated
    },
  },
  {
    timestamps: false, // Disable default timestamps
    tableName: "fitnessDetails", // Specify the table name
  }
);

// Define associations if needed
// For example, if you want to define a relationship with the User model
// FitnessDetails.belongsTo(User, { foreignKey: 'user_id' });

module.exports = FitnessDetails;

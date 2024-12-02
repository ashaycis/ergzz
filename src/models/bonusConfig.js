const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path as needed for your project structure

const BonusConfig = sequelize.define(
  "configurators",
  {
    heading: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    values: {
      type: DataTypes.INTEGER, // Stores structured data, like objects or arrays
      allowNull: true,
    },
    head_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,  // Set head_id as the primary key
      validate: {
        isInt: true, // Ensures head_id is an integer
      },
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW, // Sets the default to the current timestamp
    },
  },
  {
    tableName: "configurators", // Optional: specify the table name explicitly
    timestamps: false, // Disables automatic createdAt and updatedAt fields
  }
);

module.exports = BonusConfig;

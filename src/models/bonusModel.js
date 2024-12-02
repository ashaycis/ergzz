const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path as needed for your Sequelize instance

const BonusPoints = sequelize.define(
  "BonusPoints",
  {
    pointID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bonusPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    update_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Name of the target table (should match the User model's table name)
        key: "user_id", // Key in the target table
      },
    },
  },
  {
    timestamps: false, // No createdAt and updatedAt fields
    tableName: "bonusPoints", // Specify the table name
  }
);

// Define associations if needed
// For example, if you want to define a relationship with the User model
// BonusPoints.belongsTo(User, { foreignKey: 'user_id' });

module.exports = BonusPoints;

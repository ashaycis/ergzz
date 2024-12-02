const { DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path as needed for your Sequelize instance

// Define the Notification model
const Notification = sequelize.define(
  "Notification", // Model name should be singular and capitalized
  {
    notification_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_At: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    audience: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of user IDs for the audience
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING, // URL for the notification image
      allowNull: true,
    },
  },
  {
    timestamps: false, // Disables Sequelize's automatic timestamps
    tableName: "notifications", // Specify the table name
  }
);

module.exports = Notification;

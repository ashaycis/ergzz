const { DataTypes } = require("sequelize");
const sequelize = require("../../config"); // Adjust the path to your Sequelize instance

const MotivMess = sequelize.define(
  "motivmess",
  {
    mess_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    messContent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, // Disable automatic timestamps since they are explicitly defined
    tableName: "motivmess", // Optional: Explicitly set table name
  }
);

module.exports = MotivMess;

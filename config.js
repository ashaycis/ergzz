const { Sequelize } = require("sequelize");
require("dotenv").config(); // Ensure you load environment variables

const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Username
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST, // Database host
    dialect: "mysql", // Using mysql2
    port: process.env.DB_PORT, // Port
    logging: false, // Set to true if you want to see SQL logs
  }
);

// Test the connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;

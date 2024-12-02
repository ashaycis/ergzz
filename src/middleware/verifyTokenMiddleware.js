const jwt = require("jsonwebtoken");
// const { users } = require("../models/userModal"); // Adjust the path as needed for your Sequelize models
const { verifyToken } = require("./jwt");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure you set this in your environment variables

const verifyTokenMiddleware = async (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No Bearer token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token from the header

  try {

    // Pass the decoded token to the verifyToken function
    try {
      verifyToken(token);
      next(); // Proceed to the next middleware or route handler
    } catch (verifyError) {
      // Handle errors thrown by verifyToken function
      return res.status(403).json({ error: verifyError.message });
    }
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { verifyTokenMiddleware };

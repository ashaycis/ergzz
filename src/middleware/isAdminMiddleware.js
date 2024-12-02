const jwt = require("jsonwebtoken");
const User = require("../models/userModal"); // Adjust the path as needed for your Sequelize models
const { verifyToken } = require("./jwt");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure you set this in your environment variables

const isAdminMiddleware = async (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No Bearer token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token from the header

  try {
    // Verify the JWT token
    const decodedToken = verifyToken(token);
    console.log('decodedToken: ', decodedToken)
    // const decodedToken = jwt.verify(token, JWT_SECRET);

    // Extract user ID from the token
    const userId = decodedToken.sub;

    // Fetch user from the database using user ID
    const user = await User.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(401).json({ error: "Invalid token or user not found" });
    }

    // Check if the user has admin privileges
    if (user.isAdmin) {
      req.user = {
        id: user.user_id,
        email: user.email,
        // Attach other relevant data if necessary
      };
      next(); // User is an admin, proceed to the next middleware or route handler
    } else {
      res.status(403).json({ error: "Forbidden: Admin access required" }); // Forbidden if not an admin
    }
  } catch (error) {
    console.error("Error checking admin status:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { isAdminMiddleware };

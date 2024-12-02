const jwt = require("jsonwebtoken");

// Your secret key should be a strong, random string. Store it securely.
const secretKey = "your-very-secure-secret-key";

// Function to generate a JWT token with userID and email
function generateToken(userID, email) {
  // Payload with minimal information
  const payload = {
    sub: userID, // Subject or unique identifier for the user
    email: email, // User's email address
  };

  // Options for token
  const options = {
    algorithm: "HS256", // HMAC SHA-256 algorithm
  };

  // Generate the token
  const token = jwt.sign(payload, secretKey, options);

  return token;
}
function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return { message: "No valid bearer token found" };
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded; // Returns the decoded payload if the token is valid
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null; // or handle the error as needed
  }
}
function verifyTokenMid(req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No valid bearer token found" });
  }

  const token = authHeader.split(" ")[1]; // Get the token part

  if (typeof token !== "string") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    
    // Attach the decoded information to the request object for later use
    req.user = decoded; 
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Token is invalid" });
  }
}
module.exports = { generateToken, verifyToken, verifyTokenMid };

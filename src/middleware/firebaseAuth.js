const admin = require("firebase-admin");

/**
 * Middleware to verify Firebase ID token.
 */
async function verifyIdTokenMiddleware(req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No Bearer token provided" });
  }

  const idToken = authHeader.split(" ")[1]; // Extract the token from the header

  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach user information to the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      // Add other claims if necessary
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying ID token:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { verifyIdTokenMiddleware };

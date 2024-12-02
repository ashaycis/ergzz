const dataMissing = require("../middleware/detailMissing");
const users = require("../models/userModal");

const loginAdmin = async (req, res) => {
  const { email, password, remember } = req.body;
  console.log("email, password, remember : ", email, password, remember);

  // Define required fields
  const requiredFields = ["email", "password"];
  const userData = { email, password };

  // Check for missing fields
  const missingMessage = dataMissing(requiredFields, userData);
  if (missingMessage) {
    return res.status(400).json({ error: missingMessage });
  }

  try {
    // Fetch user from the database
    const user = await users.findOne({ where: { email } });
    // console.log("user: ", user);

    console.log(user?.user_id, user.email);

    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    // Check password
    const passwordAuthenticate = await checkPassword(user.hPassword, password);

    if (passwordAuthenticate) {
      const userID = user?.user_id; // Replace with actual user ID from your database
      const email = user.email; // Replace with actual user email

      // Generate the token
      const token = generateToken(userID, email);
      console.log("Generated JWT Token:", token);

      return res
        .status(200)
        .json({ message: "Login successful", token: token });
    } else {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  loginAdmin,
};

const bcrypt = require("bcrypt");
const saltRounds = 10; // Number of salt rounds

const hashPassword = async (password) => {
  try {
    // Await the hashing process
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err; // Optionally rethrow the error
  }
};

const checkPassword = async (hashedPassword, typedPassword) => {
  try {
    // Await the result of bcrypt.compare
    const isMatch = await bcrypt.compare(typedPassword, hashedPassword);
    return isMatch; // Return the result (true or false)
  } catch (err) {
    console.error("Error comparing passwords:", err);
    throw err; // Rethrow the error to be handled by the caller
  }
};

module.exports = { hashPassword, checkPassword };

// routes/messageRoute.js
const express = require("express");
const motivMesControl = require("../controllers/motivMesControl"); // Import the controller
const { isAdminMiddleware } = require("../middleware/isAdminMiddleware");
const { verifyTokenMid } = require("../middleware/jwt");

const router = express.Router();

router.post(
  "/createmessage",
  isAdminMiddleware,
  motivMesControl.createMotivMessage
); // Route for creating a new message
router.get("/getallmessages", motivMesControl.viewAllMotivMessage); // Route for getting all messages
router.put(
  "/updatemess",
  isAdminMiddleware,
  motivMesControl.updateMotivMessage
); // Route for updating a message
router.delete(
  "/deletemessage",
  isAdminMiddleware,
  motivMesControl.deleteMotivMessage
); // Route for deleting a message

module.exports = router;

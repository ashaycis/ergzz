// routes/fitnessRoute.js
const express = require("express");
const bonusController = require("../controllers/bonusController"); // Import the controller
const { isAdminMiddleware } = require("../middleware/isAdminMiddleware");
const { verifyTokenMiddleware } = require("../middleware/verifyTokenMiddleware");

const router = express.Router();

router.put("/updateBonus", isAdminMiddleware, bonusController.updateBonus); // Route for updating a fitness
router.put("/getBonusDetails", verifyTokenMiddleware, bonusController.getBonusDetails); // Route for updating a fitness
router.put("/updatebonusvalues", isAdminMiddleware, bonusController.updateBonusDetails);
router.get("/getAllBonusDetails", isAdminMiddleware, bonusController.getAllBonusDetail);

module.exports = router;

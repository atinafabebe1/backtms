const express = require("express");

const {
  getemergencyReport,
  getemergencyReports,
  createEmergencyReport,
  updateEmergencyReport,
  deleteEmergencyReport,
} = require("../controllers/emergencyReport");

const { Auth, Authorize } = require("../middleware/auth");
const EmergencyReport = require("../models/emergencyReport");
const advancedResult = require("../middleware/advancedResult");

const router = express.Router({ mergeParams: true });
router.use(Auth);

router.post("/", Authorize("ROLE_DRIVER"), createEmergencyReport);
router.get("/", advancedResult(EmergencyReport, ""), getemergencyReports);
router.get("/:id", getemergencyReport);
router.put("/:id", updateEmergencyReport);
router.delete("/:id", deleteEmergencyReport);

module.exports = router;

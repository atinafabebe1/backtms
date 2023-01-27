const express = require("express");

const {
  getMaintenanceReport,
  getMaintenanceReports,
  createMaintenanceReport,
  updateMaintenanceReport,
  deleteMaintenanceReport,
} = require("../controllers/maintenanceReport");

const { Auth, Authorize } = require("../middleware/auth");
const MaintenanceReport = require("../models/maintenanceReport");
const advancedResult = require("../middleware/advancedResult");

const router = express.Router({ mergeParams: true });
router.use(Auth);

router.post("/:recieverId", createMaintenanceReport);
router.get("/", advancedResult(MaintenanceReport, ""), getMaintenanceReports);
router.get("/:id", getMaintenanceReport);
router.put("/:id", updateMaintenanceReport);
router.delete("/:id", deleteMaintenanceReport);

module.exports = router;

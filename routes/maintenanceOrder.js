const express = require("express");

const {
  getMaintenanceOrder,
  getMaintenanceOrders,
  createMaintenanceOrder,
  updateMaintenanceOrder,
  deleteMaintenanceOrder,
} = require("../controllers/maintenanceOrder");

const { Auth, Authorize } = require("../middleware/auth");
const MaintenanceOrder = require("../models/maintenanceOrder");
const advancedResult = require("../middleware/advancedResult");

const router = express.Router({ mergeParams: true });
router.use(Auth);

router.post("/:recieverId", createMaintenanceOrder);
router.get("/", advancedResult(MaintenanceOrder, ""), getMaintenanceOrders);
router.get("/:id", getMaintenanceOrder);
router.put("/:id", updateMaintenanceOrder);
router.delete("/:id", deleteMaintenanceOrder);

module.exports = router;

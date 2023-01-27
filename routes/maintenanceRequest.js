const express = require("express");

const {
  createMaintenanceRequest,
  getMaintenanceRequest,
  getMaintenanceRequests,
  approveMaitenanceRequest,
  updateMaitenacneRequest,
  deleteMaintenanceRequest,
} = require("../controllers/maintenanceRequest");
const MaintenanceRequest = require("../models/maintenanceRequest");
const advancedResult = require("../middleware/advancedResult");
const { Auth, Authorize } = require("../middleware/auth");
const router = express.Router();

//router.use(Auth);
router.post("/maintenance", createMaintenanceRequest);
router.get("/maintenance/:vehicleId", getMaintenanceRequest);
router.get(
  "/maintenance",
  advancedResult(MaintenanceRequest, ""),
  getMaintenanceRequests
);
router.put(
  "/maintenance/:id",
  Authorize("ROLE_DRIVER"),
  updateMaitenacneRequest
);
router.delete(
  "/maintenance/:id",
  Authorize("ROLE_DRIVER"),
  deleteMaintenanceRequest
);
router.patch(
  "/maintenance/:id",
  Authorize("ROLE_HEADOFDEPLOYEMENT"),
  approveMaitenanceRequest
);
module.exports = router;

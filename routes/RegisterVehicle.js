const express = require("express");

const {
  getRegisteredVehicle,
  getRegisteredVehicles,
  registerVehicle,
  updateVehicleRecord,
  deleteVehicle,
} = require("../controllers/registerVehicleController");

const { Auth, Authorize } = require("../middleware/auth");
const advancedResult = require("../middleware/advancedResult");
const RegisteredVehicle = require("../models/registerVehicle");
const vehicleRequest = require("./vehicleRequest");
const vehicleTransfer = require("./vehicleTransfer");

const router = express.Router();

router.use("/:vehicleId/request/vehiclerequest", vehicleRequest);
router.use("/:vehicleId/request/vehicleTransfer", vehicleTransfer);

router.use(Auth);

router.post("/", Authorize("ROLE_HEADOFDEPLOYMENT"), registerVehicle);
router.get(
  "/",
  advancedResult(RegisteredVehicle, "VehicleRequest"),
  getRegisteredVehicles
);
router.get("/:id", getRegisteredVehicle);
router.post("/:id", updateVehicleRecord);
router.patch("/:id", deleteVehicle);

module.exports = router;

const express = require("express");

const {
  getVehicleTransfer,
  getVehicleTransfers,
  createVehicleTransfer,
  deletevehicleTransfer,
  updatevehicleTransfer,
} = require("../controllers/VehicleTransfer");
const { Auth, Authorize } = require("../middleware/auth");

const VehicleTransfer = require("../models/VehicleTransfer");
const advancedResult = require("../middleware/advancedResult");

const router = express.Router();

router.use(Auth);

router.get(
  "/transfer",
  advancedResult(VehicleTransfer, ""),
  getVehicleTransfers
);
router.get("/transfer/:id", getVehicleTransfer);
router.post(
  "/transfer/:recieverId",
  Authorize("ROLE_DRIVER"),
  createVehicleTransfer
);
router.delete("/transfer/:id", Authorize("ROLE_DRIVER"), deletevehicleTransfer);
router.patch("/transfer/:id", Authorize("ROLE_DRIVER"), updatevehicleTransfer);

module.exports = router;

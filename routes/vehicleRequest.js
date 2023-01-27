const express = require("express");

const {
  getvehicleRequest,
  getvehicleRequests,
  createvehicleRequest,
  updatevehicleRequest,
  deleteVehicleRequest,
  statusVehicleRequest,
} = require("../controllers/vehicleRequestController");

const { Auth, Authorize } = require("../middleware/auth");
const VehicleRequest = require("../models/vehicleRequest");
const advancedResult = require("../middleware/advancedResult");

const router = express.Router({ mergeParams: true });
router.use(Auth);

router.post("/vehicle/:recieverId", createvehicleRequest);
router.get("/vehicle", advancedResult(VehicleRequest, ""), getvehicleRequests);
router.get("/vehicle/:id", getvehicleRequest);
router.put("/vehicle/:id", updatevehicleRequest);
router.delete("/vehicle/:id", deleteVehicleRequest);
router.patch("/vehicle/:id", statusVehicleRequest);

module.exports = router;

const express = require("express");

const {
  getFuelRequest,
  getfuelRequests,
  createFuelRequest,
  updateFuelRequest,
  deleteFuelRequest,
  statusFuelRequest,
} = require("../controllers/fuelRequest");

const { Auth, Authorize } = require("../middleware/auth");
const FuelRequest = require("../models/fuelRequest");
const advancedResult = require("../middleware/advancedResult");

const router = express.Router({ mergeParams: true });
router.use(Auth);

router.post("/:recieverId", createFuelRequest);
router.get("/", advancedResult(FuelRequest, ""), getfuelRequests);
router.get("/:id", getFuelRequest);
router.put("/:id", updateFuelRequest);
router.delete("/:id", deleteFuelRequest);
router.put("/approve/:id", statusFuelRequest);

module.exports = router;

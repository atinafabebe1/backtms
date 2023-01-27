const express = require("express");

const {
  getSparePart,
  getSpareParts,
  createSparePart,
  updateSparePart,
  deleteSparePart,
} = require("../controllers/sparePartRequest");

const { Auth, Authorize } = require("../middleware/auth");
const SparePartRequest = require("../models/sparePartRequest");
const advancedResult = require("../middleware/advancedResult");

const router = express.Router({ mergeParams: true });
router.use(Auth);

router.post("/:recieverId", createSparePart);
router.get("/", advancedResult(SparePartRequest, ""), getSpareParts);
router.get("/:id", getSparePart);
router.put("/:id", updateSparePart);
router.delete("/:id", deleteSparePart);

module.exports = router;

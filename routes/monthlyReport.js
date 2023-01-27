const express = require("express");

const {
  getmonthlyReport,
  getmonthlyReports,
} = require("../controllers/monthlyReport.js");

const Auth = require("../middleware/auth");

const router = express.Router();
router.use(Auth);

router.get("/", getmonthlyReports);
router.get("/:id", getmonthlyReport);

module.exports = router;

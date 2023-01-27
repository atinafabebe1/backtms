const express = require("express");
const {
  RegisterUser,
  getUser,
  getUsers,
  updateUser,
} = require("../controllers/admin");

const { Auth, Authorize } = require("../middleware/auth");
const advancedResult = require("../middleware/advancedResult");
const User = require("../models/user");
const router = express.Router();

router.use(Auth);
//only during production
// router.use(Authorize("ROLE_ADMIN"));

router.get("/getusers", advancedResult(User), getUsers);
router.post("/register", RegisterUser);

router.get("/getuser/:id", getUser);
router.put("/:id", updateUser);

module.exports = router;

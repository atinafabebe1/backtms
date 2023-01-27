const express = require("express");
const {
  LoginUser,
  logoutUser,
  loginStatus,
  getMe,
  updatePassword,
  forgetPassword,
  resetPassword,
  refereshToken,
} = require("../controllers/user");
const { Auth, Authorize } = require("../middleware/auth");
const router = express.Router();
const loginLimiter = require("../middleware/loginLimiter");

router.post("/login", loginLimiter, LoginUser);
router.put("/updatePassword", Auth, updatePassword);
router.get("/logout", logoutUser);
router.get("/loginStatus", loginStatus);
router.post("/forgotpassword", forgetPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/me", Auth, getMe);
router.get("/refereshToken", refereshToken);
module.exports = router;

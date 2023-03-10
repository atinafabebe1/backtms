const User = require("../models/user");
const crypto = require("crypto");
const validator = require("validator");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");

//@desc  Login
//@route Post /user/login
//@access public
const LoginUser = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  const { email, Password } = req.body;
  if (!email || !Password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+Password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }

  //check if password matches
  const match = await user.matchPassword(Password);

  if (match) {
    // create JWTs
    const accessToken = user.getSignedJwtAccessToken();
    const newRefreshToken = user.getSignedJwtRefreshToken();

    let newRefreshTokenArray = !cookies?.token
      ? user.refreshToken
      : user.refreshToken.filter((rt) => rt !== cookies.token);

    if (cookies?.token) {
      const refreshToken = cookies.token;
      const foundToken = await User.findOne({ refreshToken }).exec();

      // Detected refresh token reuse!
      if (!foundToken) {
        // clear out ALL previous refresh tokens
        newRefreshTokenArray = [];
      }

      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "None",
        secure: false,
      });
    }

    // Saving refreshToken with current user
    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await user.save();

    // Creates Secure Cookie with refresh token
    res.cookie("token", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      maxAge: 1 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    res.json({ accessToken });
  } else {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
});

//@desc  Logout
//@route Get /user/logout
//@access public
const logoutUser = async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.token) return next(new ErrorResponse("No Content", 204));
  //No content
  const refreshToken = cookies.token;

  // Is refreshToken in db?
  const user = await User.findOne({ refreshToken }).exec();
  if (!user) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
  const result = await user.save();
  console.log(result);

  res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

//@desc Get current logged in user
//@route Post /user/me
//@access Private
const getMe = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  const user = await User.findById(req.user.id);
  res.status(200).json(user);
});

//@desc Forgot Passowrd
//@route Post /user/forgotPassword
//@access Public
const forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`There is no user with ${req.body.email}`, 404)
    );
  }

  //Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Create reset url

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/user/resetpassword/${resetToken}`;

  const message = `Your are receiving this email because you has requested the rest of pasword. Please make a PUT request to \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });
    res.status(200).json({ data: "Email Sent" });
  } catch (error) {
    user.resetPassowrdExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Email could not be send`, 500));
  }
});

//@desc Reset Password
//@route PUT /user/resetpassword/:resettoken
//@access Private
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.Password = req.body.Password;
  user.resetPasswordToken = undefined;
  user.resetPassowrdExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc Update Password
//@route PATCH /user/updatepassword
//@access Private
const updatePassword = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id).select("+Password");

  //Check current password
  const match = await user.matchPassword(req.body.currentPassword);

  if (!match) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }
  if (!validator.isStrongPassword(req.body.newPassword)) {
    return res.status(400).json({ error: "weak Password" });
  }

  const hashedPassword = await bcrpyt.hash(req.body.newPassword, 11);
  user = await User.findByIdAndUpdate(req.user.id, {
    Password: hashedPassword,
  });

  sendTokenResponse(user, 200, res);
});

//@desc Login status
//@route Get /user/loginstatus
//@access Private
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

const refereshToken = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.sendStatus(401);
  const refreshToken = cookies.token;
  res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: false });

  const foundUser = await User.findOne({ refreshToken }).exec();

  // Detected refresh token reuse!
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.REFERESH_JWT_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403); //Forbidden
        console.log("attempted refresh token reuse!");
        const hackedUser = await User.findOne({
          Username: decoded.Username,
        }).exec();
        hackedUser.refreshToken = [];
        const result = await hackedUser.save();
        console.log(result);
      }
    );
    return res.sendStatus(403); //Forbidden
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFERESH_JWT_SECRET,
    async (err, decoded) => {
      if (err) {
        console.log("expired refresh token");
        console.log(err);
        foundUser.refreshToken = [...newRefreshTokenArray];
        const result = await foundUser.save();
      }
      if (err || foundUser.Username !== decoded.Username) {
        console.log(err);
        console.log(decoded);
        return res.sendStatus(403);
      }
      // Refresh token was still valid
      const roles = foundUser.role;
      const accessToken = foundUser.getSignedJwtAccessToken();

      const newRefreshToken = foundUser.getSignedJwtRefreshToken();
      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await foundUser.save();

      // Creates Secure Cookie with refresh token
      res.cookie("token", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ roles, accessToken });
    }
  );
});

//Get token from model,create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  //Create token
  const accesstoken = user.getSignedJwtAccessToken();
  const refereshtoken = user.getSignedJwtRefreshToken();
  user.refreshToken = refereshtoken;
  await user.save();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 1 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: false,
  };

  res
    .status(statusCode)
    .cookie("token", refereshtoken, options)
    .json(accesstoken);
};

module.exports = {
  LoginUser,
  logoutUser,
  getMe,
  updatePassword,
  loginStatus,
  forgetPassword,
  resetPassword,
  refereshToken,
};

const RegisterVehicle = require("../models/registerVehicle");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc      Get all vehicle
// @route     GET /RegisteredVehicles
// @access    Private/Admin/HeadOfDeployment/Director/GeneralDirector
const getRegisteredVehicles = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single vehicle
// @route     GET /RegisteredVehicle
// @access    Private/Admin/HeadOfDeployment/Director/GeneralDirector
const getRegisteredVehicle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const registeredVehicle = await RegisterVehicle.findById(id).populate(
    "VehicleRequest"
  );
  if (!registeredVehicle) {
    return next(new ErrorResponse(`Vehicle not found with id of ${id}`, 404));
  }
  res.status(200).json({ registeredVehicle });
});

// @desc      Create a vehicle record
// @route     Post /RegisteredVehicle
// @access    Private/HeadOfDeployment/
const registerVehicle = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;
  const registerVehicle = await RegisterVehicle.create({
    ...req.body,
  });
  res.status(201).json({
    message: "Successfully Registered",
    registerVehicle: registerVehicle,
  });
});

// @desc      Update a vehicle record
// @route     Post /RegisteredVehicle/:id
// @access    Private/HeadOfDeployment/
const updateVehicleRecord = asyncHandler(async (req, res, next) => {
  let vehicle = await RegisterVehicle.findById(req.params.id);

  if (!vehicle) {
    return next(
      new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is vehicle owner
  if (vehicle.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this vehicle`,
        404
      )
    );
  }

  vehicle = await RegisterVehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ vehicle });
});

// @desc      Delete a vehicle record
// @route     Delete /RegisteredVehicle/:id
// @access    Private/HeadOfDeployment/
const deleteVehicle = asyncHandler(async (req, res, next) => {
  let vehicle = await RegisterVehicle.findOne({ _id: req.params.id });

  if (!vehicle) {
    return next(
      new ErrorResponse(`Vehicle not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is vehicle owner
  if (vehicle.user.toString() !== req.user.id && req.user.role !== "admin") {
    // added role check for admin users to delete any vehicle
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this vehicle`,
        401
      )
    );
  }

  vehicle = await RegisterVehicle.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  ); // Updated the code to use findByIdAndUpdate instead of save() to update the document

  res.status(200).json({ message: "Status Updated Successfully" });
});

module.exports = {
  registerVehicle,
  getRegisteredVehicles,
  getRegisteredVehicle,
  updateVehicleRecord,
  deleteVehicle,
};

const VehicleTransfer = require("../models/VehicleTransfer");
const mongoose = require("mongoose");
const role = require("../middleware/role");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc      Get all Vehicle Transfers
// @route     GET /Request/Vehicle/transfers
// @access    Private/HeadOfDeployment/Director/GeneralDirector/
const getVehicleTransfers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single Vehicle Request
// @route     GET /Request/Vehicle/Transfer/:id
// @access    Private/HeadOfDeployment/Director/GeneralDirector/Employee/Driver
const getVehicleTransfer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const vehicleTransfer = await VehicleTransfer.findById(id);
  if (!vehicleTransfer) {
    return next(
      new ErrorResponse(`Vehicle Request  not found with id of ${id}`, 404)
    );
  }
  res.status(200).json(vehicleTransfer);
});

// @desc      Create  Vehicle Transfer
// @route     Post /Request/Vehicle/Transfer
// @access    Private/Driver
const createVehicleTransfer = asyncHandler(async (req, res, next) => {
  req.body.recieverId = req.params.recieverId;
  req.body.user = req.user.id;
  const vehicle = await VehicleTransfer.getVehicleByPlateNumber(
    req.body.plateNumber
  );
  if (!vehicle) {
    return next(
      new ErrorResponse(
        `Vehicle not found with plate number of ${req.body.plateNumber}`,
        404
      )
    );
  }
  req.body.vehicle = vehicle._id;
  const vehicleTransfer = await VehicleTransfer.create(req.body);
  res.status(200).json(vehicleTransfer);
});

// @desc      Delete a Vehicle Request
// @route     Delete /Request/Vehicle/Transfer:id
// @access    Private/Driver/Employee
const deletevehicleTransfer = asyncHandler(async (req, res, next) => {
  let vehicleTransfers = await VehicleTransfer.findById(req.params.id);
  if (!vehicleTransfers) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is vehicle owner
  if (vehicleTransfers.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to Delete this vehicle transfer`,
        404
      )
    );
  }

  vehicleTransfers.remove();
  res.status(200).json({ message: "Successfully Removed" });
});

// @desc      Update a Vehicle Request
// @route     Put /Request/Vehicle/Transfer/:id
// @access    Private/Driver
const updatevehicleTransfer = asyncHandler(async (req, res, next) => {
  let vehicleTransfers = await VehicleTransfer.findById(req.params.id);
  if (!vehicleTransfers) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is vehicle owner
  if (vehicleTransfers.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this vehicle transfer`,
        404
      )
    );
  }
  vehicleTransfers = await VehicleTransfer.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(vehicleTransfers);
});

module.exports = {
  getVehicleTransfer,
  getVehicleTransfers,
  createVehicleTransfer,
  updatevehicleTransfer,
  deletevehicleTransfer,
};

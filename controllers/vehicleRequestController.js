const VehicleRequestSchema = require("../models/vehicleRequest");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc      Get all Vehicle Request
// @route     GET /Request/Vehicle
// @access    Private/HeadOfDeployment/Director/GeneralDirector/Employee
const getvehicleRequests = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single Vehicle Request
// @route     GET /Request/Vehicle/:id
// @access    Private/HeadOfDeployment/Director/GeneralDirector/Employee/Driver
const getvehicleRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const vehicleRequest = await VehicleRequestSchema.findById(id).populate({
    path: "user recieverId",
    select: "firstName lastName",
  });

  if (!vehicleRequest) {
    return next(
      new ErrorResponse(`Vehicle Request  not found with id of ${id}`, 404)
    );
  }
  res.status(200).json(vehicleRequest);
});

// @desc      Create all Vehicle Request
// @route     Post /Request/Vehicle/:recieverID
// @access    Private/Employee/Driver
const createvehicleRequest = asyncHandler(async (req, res, next) => {
  req.body.recieverId = req.params.recieverId;
  req.body.user = req.user.id;

  const vehicle = await VehicleRequestSchema.getVehicleByPlateNumber(
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

  const vehicleRequest = await VehicleRequestSchema.create(req.body);
  res.status(200).json(vehicleRequest);
});

// @desc      Update a Vehicle Request
// @route     Put /Request/Vehicle/:id
// @access    Private/Driver/Employee
const updatevehicleRequest = asyncHandler(async (req, res, next) => {
  let vehicleRequest = await VehicleRequestSchema.findById(req.params.id);

  if (!vehicleRequest) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is vehicle owner
  if (vehicleRequest.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this vehicle`,
        404
      )
    );
  }
  vehicleRequest = await VehicleRequestSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(vehicleRequest);
});

// @desc      Delete a Vehicle Request
// @route     Delete /Request/Vehicle
// @access    Private/Driver/Employee
const deleteVehicleRequest = asyncHandler(async (req, res, next) => {
  let vehicleRequest = await VehicleRequestSchema.findById(req.params.id);

  if (!vehicleRequest) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is vehicle owner
  if (vehicleRequest.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this vehicle`,
        404
      )
    );
  }
  vehicleRequest.remove();

  res.status(200).json({ message: "Removed Successfully" });
});

// @desc      Approve a Vehicle Request
// @route     Patch /Request/Vehicle/:id
// @access    Private/HeadofDeployemnt/Director
const statusVehicleRequest = asyncHandler(async (req, res, next) => {
  let vehicleRequest = await VehicleRequestSchema.findById(req.params.id);

  if (!vehicleRequest) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }
  if (vehicleRequest.isDeleted === true) {
    return next(
      new ErrorResponse(
        `Can not approve because the vehicle associated with request is deleted`,
        404
      )
    );
  }
  if (req.body.isApproved === "Approved") {
    const vehicle = await SparePart.getVehicleByPlateNumber(
      maintenanceRequest.plateNumber
    );

    if (!vehicle) {
      return next(
        new ErrorResponse(
          `Vehicle not found with plate number of ${req.body.plateNumber}`,
          404
        )
      );
    }
    vehicleRequest = await VehicleRequestSchema.findByIdAndUpdate(
      req.params.id,
      {
        vehicle: vehicle._id,
        isApproved: req.body.isApproved,
      }
    );
  } else {
    vehicleRequest = await VehicleRequestSchema.findOneAndUpdate(
      req.params.id,
      {
        isApproved: req.body.isApproved,
      }
    );
  }

  res.status(200).json("Done");
});

module.exports = {
  getvehicleRequest,
  getvehicleRequests,
  createvehicleRequest,
  updatevehicleRequest,
  deleteVehicleRequest,
  statusVehicleRequest,
};

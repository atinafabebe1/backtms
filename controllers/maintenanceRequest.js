const MaintenanceRequest = require("../models/maintenanceRequest");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose");

//@desc Create Maintenance Request
//@route Post /Request/maintenance
//@access Private/Driver
const createMaintenanceRequest = asyncHandler(async (req, res, next) => {
  req.body.recieverId = req.params.recieverId;
  req.body.user = req.user.id;

  if (
    req.body.isapproved === "Approved" ||
    req.body.isapproved === "Rejected"
  ) {
    return next(new ErrorResponse("You can't approve or reject now", 401));
  }

  await MaintenanceRequest.create(req.body);
  res.status(200).json({ message: "Your Request is successfully sent" });
});

//@desc Get a single Maintenance Request
//@route Get /Request/maintenance/:vehicleId
//@access Private/Driver/HeadofDeployment/Director
const getMaintenanceRequest = asyncHandler(async (req, res) => {
  const maintenanceRequest = await MaintenanceRequest.findById(req.params.id);
  if (!maintenanceRequest) {
    return next(
      new ErrorResponse(`Maintenance request not found with id of ${id}`, 404)
    );
  }
  res.status(200).json(maintenanceRequest);
});

//@desc Get all Maintenance Request
//@route Get /Request/maintenance
//@access Private/Driver/HeadofDeployment/Director
const getMaintenanceRequests = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Update a Maintenance Request
// @route     Put /Request/maintenance/:id
// @access    Private/Driver/HeadofDeployment/Director
const updateMaitenacneRequest = asyncHandler(async (req, res, next) => {
  let maintenanceRequest = await MaintenanceRequest.findById(req.params.id);

  if (!maintenanceRequest) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }
  //Make sure user is vehicle owner
  if (maintenanceRequest.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this vehicle`,
        404
      )
    );
  }
  vehicleRequest = await MaintenanceRequest.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(maintenanceRequest);
});

// @desc      Approve a Maintenance Request
// @route     Patch /Request/Vehicle/:id
// @access    Private/HeadofDeployemnt/Director
const approveMaitenanceRequest = asyncHandler(async (req, res, next) => {
  let maintenanceRequest = await MaintenanceRequest.findById(req.params.id);

  if (!maintenanceRequest) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }
  if (maintenanceRequest.isDeleted === true) {
    return next(
      new ErrorResponse(
        `Cann't approve because the vehicle associated with request is deleted`,
        404
      )
    );
  }
  if (req.body.isApproved === "Approved") {
    const vehicle = await MaintenanceRequest.getVehicleByPlateNumber(
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
    maintenanceRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      {
        vehicle: vehicle._id,
        isApproved: req.body.isApproved,
      }
    );
  } else {
    maintenanceRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: req.body.isApproved,
      }
    );
  }

  res.status(200).json("Done");
});

// @desc      Delete a Vehicle Request
// @route     Delete /Request/Vehicle
// @access    Private/Driver/Employee
const deleteMaintenanceRequest = asyncHandler(async (req, res, next) => {
  let maintenanceRequest = await MaintenanceRequest.findById(req.params.id);

  if (!maintenanceRequest) {
    return next(
      new ErrorResponse(`Request not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure user is vehicle owner
  if (maintenanceRequest.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this vehicle`,
        404
      )
    );
  }
  maintenanceRequest.remove();

  res.status(200).json({ message: "Removed Successfully" });
});
module.exports = {
  createMaintenanceRequest,
  getMaintenanceRequest,
  getMaintenanceRequests,
  updateMaitenacneRequest,
  approveMaitenanceRequest,
  deleteMaintenanceRequest,
};

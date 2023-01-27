const MaintenanceReport = require("../models/maintenanceReport");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");

//@desc      to get All Maintenance Report
//@route     GET/http://localhost:3500/MaintenanceReport
//@access    GARAGEDIRECTOR
const getMaintenanceReports = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

//@desc      to get single Maintenance Report
//@route     GET/http://localhost:3500/MaintenanceReport/:ID
//@access    MECHANIC/GARAGEDIRECTOR
const getMaintenanceReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const maintenanceReport = await MaintenanceReport.findById(id).populate({
    path: "user",
    select: "firstName lastName",
  });

  if (!maintenanceReport) {
    return next(
      new ErrorResponse(`Maintenance report not found with id of ${id}`, 404)
    );
  }
  res.status(200).json(maintenanceReport);
});

//@desc      to Create Maintenance Report
//@route     POST/http://localhost:3500/MaintenanceReport
//@access    MECHANIC
const createMaintenanceReport = asyncHandler(async (req, res) => {
  req.body.user = req.user.id;
  const vehicle = await MaintenanceReport.getVehicleByPlateNumber(
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
  const maintenanceReport = await MaintenanceReport.create(req.body);
  res.status(200).json(maintenanceReport);
});

//@desc      to Update single Maintenance Report
//@route     PUT/http://localhost:3500/MaintenanceReport/:ID
//@access    MECHANIC
const updateMaintenanceReport = asyncHandler(async (req, res, next) => {
  let maintenanceReport = await MaintenanceReport.findById(req.params.id);

  if (!maintenanceReport) {
    return next(
      new ErrorResponse(
        `Maintenance Report not found with id of ${req.params.id}`,
        404
      )
    );
  }
  //Make sure user is vehicle owner
  if (maintenanceReport.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this maintenance Order`,
        404
      )
    );
  }
  maintenanceReport = await MaintenanceReport.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(maintenanceReport);
});

//@desc      to Delete single Maintenance Report
//@route     DELETE/http://localhost:3500/MaintenanceReport/:ID
//@access    MECHANIC/GARAGEDIRECTOR
const deleteMaintenanceReport = asyncHandler(async (req, res, next) => {
  let maintenanceReport = await MaintenanceReport.findById(req.params.id);
  if (!maintenanceReport) {
    return next(
      new ErrorResponse(
        `Maintenanc Report not found with id of ${req.params.id}`,
        404
      )
    );
  }
  // to be sure user is maintenance Report owner!!
  if (maintenanceReport.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User not authorized to delete this Maintenance Order`,
        404
      )
    );
  }
  maintenanceReport.remove();
  res.status(200).json({ message: "Successfully Removed" });
});

module.exports = {
  createMaintenanceReport,
  getMaintenanceReports,
  updateMaintenanceReport,
  getMaintenanceReport,
  deleteMaintenanceReport,
};

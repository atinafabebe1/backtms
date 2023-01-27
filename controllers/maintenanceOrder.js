const MaintenanceOrder = require("../models/maintenanceOrder");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const mongoose = require("mongoose");

//@desc       to get all Maintenance Orders
//@routee     GET/http://localhost:3500/MaintenanceOrder
//@access     GARAGEDIRECTOR
const getMaintenanceOrders = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

//@desc       to get single Maintenance Order
//@routee     GET/http://localhost:3500/MaintenanceOrder/:ID
//@access     GARAGEDIRECTOR
const getMaintenanceOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const maintenanceOrder = await MaintenanceOrder.findById(id).populate({
    path: "user vehicle",
    select: "firstName lastName",
  });

  if (!maintenanceOrder) {
    return next(
      new ErrorResponse(`Maintenance Order not found with id of ${id}`, 404)
    );
  }
  res.status(200).json(maintenanceOrder);
});
//@desc       to Create Maintenance Order
//@routee     POST/http://localhost:3500/MaintenanceOrder
//@access     GARAGEDIRECTOR
const createMaintenanceOrder = asyncHandler(async (req, res) => {
  req.body.reciever = req.params.reciever;
  req.body.user = req.user.id;

  const vehicle = await MaintenanceOrder.getVehicleByPlateNumber(
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
  const maintenanceOrder = await MaintenanceOrder.create(req.body);
  res.status(200).json(maintenanceOrder);
});

//@desc       to Update single Maintenance Order
//@routee     PUT/http://localhost:3500/MaintenanceOrder/:ID
//@access     GARAGEDIRECTOR
const updateMaintenanceOrder = asyncHandler(async (req, res, next) => {
  let maintenanceOrder = await MaintenanceOrder.findById(req.params.id);

  if (!maintenanceOrder) {
    return next(
      new ErrorResponse(
        `Maintenance Order not found with id of ${req.params.id}`,
        404
      )
    );
  }
  //Make sure user is vehicle owner
  if (maintenanceOrder.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this maintenance Order`,
        404
      )
    );
  }
  maintenanceOrder = await MaintenanceOrder.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(maintenanceOrder);
});

//@desc       to Delete Maintenance Order
//@routee     DELETE/http://localhost:3500/MaintenanceOrder/:ID
//@access     GARAGEDIRECTOR
const deleteMaintenanceOrder = asyncHandler(async (req, res, next) => {
  let maintenanceOrder = await MaintenanceOrder.findById(req.params.id);
  if (!maintenanceOrder) {
    return next(
      new ErrorResponse(
        `Maintenanc Order not found with id of ${req.params.id}`,
        404
      )
    );
  }
  // to be sure user is fuel Request owner!!
  if (maintenanceOrder.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User not authorized to delete this Maintenance Order`,
        404
      )
    );
  }
  maintenanceOrder.remove();
  res.status(200).json({ message: "Successfully Removed" });
});

module.exports = {
  createMaintenanceOrder,
  getMaintenanceOrder,
  updateMaintenanceOrder,
  getMaintenanceOrders,
  deleteMaintenanceOrder,
};

const FuelRequest = require("../models/fuelRequest");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc      to get all sent fuel requests
//@route     http://localhost:3500/FuelRequest
//@access    FuelDistribute/HOD
const getfuelRequests = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

//@desc        to get single fuel request
//@route       GET/http://localhost:3500/FuelRequest/:Id
//access       FuelDistributer/HOD
const getFuelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const fuelRequest = await FuelRequest.findById(id).populate({
    path: "user recieverId",
    select: "firstName lastName",
  });

  if (!fuelRequest) {
    return next(
      new ErrorResponse(`Fuel Request not found with id of ${id}`, 404)
    );
  }
  res.status(200).json(fuelRequest);
});

//@desc       to create fuel request
//@route      POST/http://localhost:3500/FuelRequest
//@access     DRIVER/EMPLOYEE
const createFuelRequest = asyncHandler(async (req, res, next) => {
  req.body.recieverId = req.params.recieverId;
  req.body.user = req.user.id;

  const vehicle = await FuelRequest.getVehicleByPlateNumber(
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

  // req.body.vehicle = vehicle._id;

  const fuelRequest = await FuelRequest.create(req.body);
  res.status(200).json(fuelRequest);
});

//@desc       to update sent fuel request
//@routee     PUT/http://localhost:3500/FuelRequest
//@access     DRIVER/EMPLOYEE
const updateFuelRequest = asyncHandler(async (req, res, next) => {
  let fuelRequest = await FuelRequest.findById(req.params.id);

  if (!fuelRequest) {
    return next(
      new ErrorResponse(
        `Fuel request not found with id of ${req.params.id}`,
        404
      )
    );
  }
  //Make sure user is vehicle owner
  if (fuelRequest.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this fuel Request`,
        404
      )
    );
  }
  fuelRequest = await FuelRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json(fuelRequest);
});

//@desc       to delete sent fuel request
//@route      DELETE/http://localhost:3500/FuelRequest
//@access     DRIVER/EMPLOYEE
const deleteFuelRequest = asyncHandler(async (req, res, next) => {
  let fuelRequest = await FuelRequest.findById(req.params.id);
  if (!fuelRequest) {
    return next(
      new ErrorResponse(
        `Fuel Request not found with id of ${req.params.id}`,
        404
      )
    );
  }
  // to be sure user is fuel Request owner!!
  if (fuelRequest.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User not authorized to delete this fuel Request`, 404)
    );
  }
  fuelRequest.remove();
  res.status(200).json({ message: "Successfully Removed" });
});

// @desc      Approve a Vehicle Request
// @route     Patch /Request/fuelRequest/:id
// @access    Private/HeadofDeployemnt/Director
const statusFuelRequest = asyncHandler(async (req, res, next) => {
  let fuelRequest = await FuelRequest.findById(req.params.id);

  if (!fuelRequest) {
    return next(
      new ErrorResponse(
        `Fuel Request not found with id of ${req.params.id}`,
        404
      )
    );
  }
  if (fuelRequest.isDeleted === true) {
    return next(
      new ErrorResponse(
        `Cann't approve because the vehicle associated with request is deleted`,
        404
      )
    );
  }

  if (req.body.isApproved == "Approved") {
    const vehicle = await FuelRequest.getVehicleByPlateNumber(
      fuelRequest.plateNumber
    );

    if (!vehicle) {
      return next(
        new ErrorResponse(
          `Vehicle not found with plate number of ${req.body.plateNumber}`,
          404
        )
      );
    }
    console.log(req.body.isApproved);
    console.log(vehicle._id);
    fuelRequest = await FuelRequest.findByIdAndUpdate(req.params.id, {
      vehicle: vehicle._id,
      isApproved: req.body.isApproved,
    });
    fuelRequest.save();
  } else {
    fuelRequest = await fuelRequestSchema.findByIdAndUpdate(req.params.id, {
      isApproved: req.body.isApproved,
    });
  }
  res.status(200).json("Done");
});

module.exports = {
  createFuelRequest,
  getFuelRequest,
  getfuelRequests,
  updateFuelRequest,
  deleteFuelRequest,
  statusFuelRequest,
};

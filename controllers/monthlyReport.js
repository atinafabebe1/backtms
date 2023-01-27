const MonthlyReportSchema = require("../models/monthlyReport");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Vehicle = require("../models/registerVehicle");
const FuelRequest = require("../models/fuelRequest");
const MaintenanceReport = require("../models/maintenanceReport");

//@desc      to get all sent monthly Report
//@route     http://localhost:3500/monthlyReport
//@access    Director/HOD
const getmonthlyReports = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

//@desc        to get single Report
//@route       GET/http://localhost:3500/monthlyReport/:Id
//access       Director/HOD
const getmonthlyReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const fuelRequest = await MonthlyReportSchema.findById(id).populate({
    path: "vehicle",
  });

  if (!fuelRequest) {
    return next(
      new ErrorResponse(`MonthlyReport Not found with id of ${id}`, 404)
    );
  }
  res.status(200).json(fuelRequest);
});

//@desc       to create fuel request
//@route      POST/http://localhost:3500/FuelRequest
//@access     DRIVER/EMPLOYEE
const generateMonthlyReport = asyncHandler(async (req, res) => {
  // query our vehicles collection to get all vehicles in system
  const vehicles = await Vehicle.find();
  //loop through each vehicle
  for (let v of vehicles) {
    let currentMonthlyCosts;
    try {
      //calculate monthly costs from above
      currentMonthlyCosts = await monthlyVehicleCosts(v._id);
    } catch (err) {
      console.log("error calculating monthly costs", err);
    }
    console.log(currentMonthlyCosts);
    // save results into a document in our monthlyReport collection
    try {
      await MonthlyReportSchema.create({
        vehicle: v._id,
        date: new Date(),
        totalFuelCost: currentMonthlyCosts.costOfFuels,
        tierMaintenanceCost: currentMonthlyCosts.costOfMaintenances,
      });
    } catch (err) {
      console.log("error saving in MonthlyReport", err);
    }
  }
});

async function monthlyVehicleCosts(vehicleId) {
  // get all fuel documents associated with this vehicle
  const fuels = await FuelRequest.find({ vehicle: vehicleId });

  // sum the costs of all fuels for this vehicle
  const costOfFuels = fuels.reduce((sum, fDoc) => {
    return sum + fDoc.amountOfFuelUsed;
  }, 0);

  // get all maintenance documents associated with this vehicle
  const maintenances = await MaintenanceReport.find({ vehicle: vehicleId });

  //sum the costs of all maintenances for this vehcile
  const costOfMaintenances = maintenances.reduce((sum, mDoc) => {
    return sum + mDoc.paymentPerTime?.Birr;
  }, 0);

  // return an object with totals for fuels and maintenances
  return { costOfFuels, costOfMaintenances };
}

module.exports = {
  getmonthlyReport,
  getmonthlyReports,
  generateMonthlyReport,
};

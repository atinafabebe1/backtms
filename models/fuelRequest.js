const mongoose = require("mongoose");
const ErrorResponse = require("../middleware/error");
const Schema = mongoose.Schema;

const FuelRequestSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleRecord",
    },
    plateNumber: {
      type: Number,
      required: true,
    },
    typeOfVehicle: {
      type: String,
      required: true,
    },
    typeOfFuel: {
      type: String,
      required: true,
    },
    prevRecordOnCounter: {
      type: Number,
      required: true,
    },
    currentRecordOnCounter: {
      type: Number,
      required: true,
    },
    sourceLocation: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    distanceTraveled: {
      type: Number,
      required: true,
    },
    amountOfFuelUsed: {
      type: Number,
      required: true,
    },
    isApproved: {
      type: String,
      default: "Waiting Approval",
      enum: ["Waiting Approval", "Rejected", "Approved"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

FuelRequestSchema.pre("save", async function (next) {
  const vehicle = await this.model("VehicleRecord").findOne({
    plateNumber: this.plateNumber,
  });
  if (!vehicle) {
    return next(
      new ErrorResponse(
        `Vehicle Not Found with plate number of ${this.plateNumber}`,
        404
      )
    );
  }
  next();
});

FuelRequestSchema.statics.getVehicleByPlateNumber = async function (
  plateNumber
) {
  const vehicle = await this.model("VehicleRecord")
    .findOne({ plateNumber })
    .select({ _id: 1 });
  return vehicle;
};

module.exports = mongoose.model("FuelRequest", FuelRequestSchema);

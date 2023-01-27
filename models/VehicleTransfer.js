const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const VehicleTransferSchema = new Schema(
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
      required: true,
      ref: "VehicleRecord",
    },
    date: {
      type: Date,
      required: true,
    },
    modelOfVehicle: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: Number,
      required: true,
    },
    status: {
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

VehicleTransferSchema.statics.getVehicleByPlateNumber = async function (
  plateNumber
) {
  const vehicle = await this.model("VehicleRecord")
    .findOne({ plateNumber })
    .select({ _id: 1 });

  return vehicle;
};

module.exports = mongoose.model("Vehicle Transfer", VehicleTransferSchema);

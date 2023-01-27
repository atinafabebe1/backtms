const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EmergencyReportSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleRecord",
      required: true,
    },
    plateNumber: {
      type: Number,
      required: true,
    },
    dateTimeofDanger: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    properties: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    insurance: {
      type: String,
      required: true,
    },
    injuries: {
      type: Number,
      required: true,
    },
    death: {
      type: Number,
      required: true,
    },
    damagedProperties: {
      type: Number,
      required: true,
    },
    witnessName: {
      type: String,
      required: true,
    },
    witnessAddress: {
      type: String,
      required: true,
    },
    peopleinDangerZone: {
      type: String,
      required: true,
    },
    trafficName: {
      type: String,
      required: true,
    },
    trafficSite: {
      type: String,
      required: true,
    },
    trafficaddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

EmergencyReportSchema.pre("save", async function (next) {
  const vehicle = await this.model("VehicleRecord").findOne({
    plateNumber: this.plateNumber,
  });
  if (!vehicle) {
    return next(
      new ErrorResponse(
        `Vehicle not found with plate number of ${this.plateNumber}`,
        404
      )
    );
  }
  next();
});

EmergencyReportSchema.statics.getVehicleByPlateNumber = async function (
  plateNumber
) {
  const vehicle = await this.model("VehicleRecord")
    .findOne({ plateNumber })
    .select({ _id: 1 });
  return vehicle;
};

module.exports = mongoose.model("EmergencyReport", EmergencyReportSchema);

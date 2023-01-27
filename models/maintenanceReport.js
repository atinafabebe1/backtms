const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MaintenanceReportSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
    finishedMaintenanceName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mechanicName: {
      type: String,
      required: true,
    },
    noOfdateTomaintain: {
      type: Number,
      required: true,
    },
    paymentPerTime: {
      Birr: {
        type: Number,
        // required: true
      },
      coin: {
        type: Number,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);
MaintenanceReportSchema.pre("save", async function (next) {
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

MaintenanceReportSchema.statics.getVehicleByPlateNumber = async function (
  plateNumber
) {
  const vehicle = await this.model("VehicleRecord")
    .findOne({ plateNumber })
    .select({ _id: 1 });
  return vehicle;
};

module.exports = mongoose.model("Maintenance Report", MaintenanceReportSchema);

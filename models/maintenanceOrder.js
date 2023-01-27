const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MaintenanceOrderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    plateNumber: {
      type: Number,
      required: true,
    },
    typeOfVehicle: {
      type: String,
      required: true,
    },
    assignedWorkflow: {
      type: String,
      required: true,
    },
    kilometerOnCounter: {
      type: Number,
      required: true,
    },
    receiverMechanicName: {
      type: String,
      required: true,
    },
    orderedDateTime: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

MaintenanceOrderSchema.pre("save", async function (next) {
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

MaintenanceOrderSchema.statics.getVehicleByPlateNumber = async function (
  plateNumber
) {
  const vehicle = await this.model("VehicleRecord")
    .findOne({ plateNumber })
    .select({ _id: 1 });
  return vehicle;
};

module.exports = mongoose.model("Maintenance Order", MaintenanceOrderSchema);

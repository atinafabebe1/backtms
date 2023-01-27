const mongoose = require("mongoose");
const VehicleRequest = require("./vehicleRequest");
const VehicleTransfer = require("./VehicleTransfer");
const EmergencyReport = require("./emergencyReport");
const FuelRequest = require("./fuelRequest");
const MaintenanceReport = require("./maintenanceReport");
const Schema = mongoose.Schema;

const VehicleRecordSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    ModelNo: {
      type: Number,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 10,
    },
    ChassisNo: {
      type: Number,
      unique: true,
      minlength: 3,
      maxlength: 10,
    },
    MotorNo: {
      type: Number,
      unique: true,
      minlength: 3,
      maxlength: 10,
    },
    CC: {
      type: String,
    },
    PurchasePrice: {
      type: String,
    },
    plateNumber: {
      type: Number,
      unique: true,
      minlength: 3,
      maxlength: 10,
    },
    TypeOfFuel: {
      type: String,
    },
    PurchasedDate: {
      type: Date,
    },
    MaxPerson: {
      type: Number,
    },
    MaxLoad: {
      type: Number,
    },
    MaxLitres: {
      type: Number,
    },
    ProprietaryIdNumber: {
      type: Number,
    },

    VehicleImage: {
      data: Buffer,
      contentType: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

VehicleRecordSchema.pre("findOneAndUpdate", async function (next) {
  console.log("Vehicle Request status being Updated from Vehicle Record");
  console.log(this._conditions._id);
  await VehicleRequest.updateMany(
    { vehicle: this._conditions._id },
    { isDeleted: true }
  );
  await VehicleTransfer.updateMany(
    { vehicle: this._conditions._id },
    { isDeleted: true }
  );
  await FuelRequest.updateMany(
    { vehicle: this._conditions._id },
    { isDeleted: true }
  );
  await MaintenanceReport.updateMany(
    { vehicle: this._conditions._id },
    { isDeleted: true }
  );
  await EmergencyReport.updateMany(
    { vehicle: this._conditions._id },
    { isDeleted: true }
  );
  next();
});

// VehicleRecordSchema.pre("findOneAndUpdate", async function (next) {
//   if (this.isDeleted !== false) {
//     console.log("Vehicle Request status being Updated from Vehicle Record");
//     console.log(this._conditions._id);
//     await VehicleRequest.updateMany(
//       { vehicle: this._conditions._id },
//       { isDeleted: false }
//     );
//   }
//   next();
// });

VehicleRecordSchema.virtual("VehicleRequest", {
  ref: "Vehicle Request",
  localField: "plateNumber",
  foreignField: "plateNumber",
  justOne: false,
});

VehicleRecordSchema.virtual("MaintenanceRequest", {
  ref: "Maintenance Request",
  localField: "plateNumber",
  foreignField: "plateNumber",
  justOne: false,
});

module.exports = mongoose.model("VehicleRecord", VehicleRecordSchema);

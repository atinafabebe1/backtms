require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss_clean = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const socket = require("socket.io");
const errorHandler = require("./middleware/error");
const cron = require("node-cron");

//Route files
const UserRouter = require("./routes/user");
const VehiclesRecord = require("./routes/RegisterVehicle");
const VehicleRequest = require("./routes/vehicleRequest");
const VehicleTransfer = require("./routes/vehicleTransfer");
const FuelRequest = require("./routes/fuelRequest");
const Admin = require("./routes/admin");
const MaintenanceRequest = require("./routes/maintenanceRequest");
const EmergencyReport = require("./routes/emergencyReport");
const SparePartRequest = require("./routes/sparePartRequest");
const MaintenanceOrder = require("./routes/maintenanceOrder");
const MaintenanceReport = require("./routes/maintenanceReport");

const { generateMonthlyReport } = require("./controllers/monthlyReport");

const mongoose = require("mongoose");
const maintenanceRequest = require("./models/maintenanceRequest");
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3500/" }));
app.use(express.json());
app.use(cookieParser());

const API_KEY = process.env.API_KEY;

//Sanitize mongoose
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//prevent XSS attack
app.use(xss_clean());

//Rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 mintues
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

//prevent http param pollution
app.use(hpp());

app.use(limiter);

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

//Mount files
app.use("/user", UserRouter, Admin);
app.use("/VehicleRecord", VehiclesRecord);
app.use("/Request/", VehicleRequest, VehicleTransfer, MaintenanceRequest);
app.use("/FuelRequest", FuelRequest);
app.use("/EmergencyReport", EmergencyReport);
app.use("/SparePartRequest", SparePartRequest);
app.use("/MaintenanceOrder", MaintenanceOrder);
app.use("/MaintenanceReport", MaintenanceReport);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to mongo & listening on port", process.env.PORT);
    });
    cron.schedule("*/50 * * * *", () => {
      generateMonthlyReport();
    });
  })
  .catch((error) => {
    console.log(error);
  });

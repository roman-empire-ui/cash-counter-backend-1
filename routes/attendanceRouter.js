import express from "express";
import {
  markAttendance,
  getMonthlyAttendance,
  updateAttendanceStatus,
  getMonthlySummary
} from "../controllers/attendanceCon.js";

const app = express.Router();

app.post("/mark", markAttendance);
app.get("/getMonSummary", getMonthlySummary);
app.put("/update", updateAttendanceStatus);

app.get("/:employeeId/:year/:month", getMonthlyAttendance);


export default app;
import Attendance from "../models/attendenceModel.js";
import Employee from "../models/employeeModel.js";

// 🔹 Normalize Date
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 🔹 Get Month Range
const getMonthRange = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
};



// ==================================================
// 1️⃣ Mark Attendance
// ==================================================
export const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.isActive) {
      return res.status(404).json({
        success: false,
        message: "Employee not found or inactive"
      });
    }

    const selectedDate = normalizeDate(date);

    // ❌ Prevent duplicate entry
    const existing = await Attendance.findOne({
      employeeId,
      date: selectedDate
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date"
      });
    }

    const { start, end } = getMonthRange(selectedDate);

    // 🔥 Validate WeekOff Limit
    if (status === "WeekOff") {
      const usedWeekOffs = await Attendance.countDocuments({
        employeeId,
        status: "WeekOff",
        date: { $gte: start, $lte: end }
      });

      if (usedWeekOffs >= employee.allowedWeekOffs) {
        return res.status(400).json({
          success: false,
          message: "WeekOff limit exceeded for this month"
        });
      }
    }

    const attendance = await Attendance.create({
      employeeId,
      date: selectedDate,
      status
    });

    res.status(201).json({
      success: true,
      data: attendance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==================================================
// 2️⃣ Get Monthly Attendance Records
// ==================================================
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { employeeId, year, month } = req.params;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const records = await Attendance.find({
      employeeId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: records
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==================================================
// 3️⃣ Get Monthly Summary (Counts Only)
// ==================================================
export const getMonthlySummary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      presentDays: 0,
      weekOffDays: 0,
      absentDays: 0,
      lossOfPayDays: 0
    };

    attendances.forEach((a) => {
      if (a.status === "Present") summary.presentDays++;
      if (a.status === "WeekOff") summary.weekOffDays++;
      if (a.status === "Absent") summary.absentDays++;
      if (a.status === "LossOfPay") summary.lossOfPayDays++;
    });

    res.status(200).json({
      success: true,
      data: {
        employeeName: employee.name,
        month,
        year,
        ...summary
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==================================================
// 4️⃣ Update Attendance Status
// ==================================================
export const updateAttendanceStatus = async (req, res) => {
  try {
    const { employeeId, date, newStatus } = req.body;

    const normalizedDate = normalizeDate(date);

    const attendance = await Attendance.findOne({
      employeeId,
      date: normalizedDate
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    const employee = await Employee.findById(employeeId);

    // 🔥 If changing to WeekOff → re-check monthly limit
    if (newStatus === "WeekOff") {
      const { start, end } = getMonthRange(normalizedDate);

      const usedWeekOffs = await Attendance.countDocuments({
        employeeId,
        status: "WeekOff",
        date: { $gte: start, $lte: end },
        _id: { $ne: attendance._id }
      });

      if (usedWeekOffs >= employee.allowedWeekOffs) {
        return res.status(400).json({
          success: false,
          message: "WeekOff limit exceeded for this month"
        });
      }
    }

    attendance.status = newStatus;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
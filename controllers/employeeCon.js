import Employee from "../models/employeeModel.js";


// ✅ 1️⃣ Create Employee
export const createEmployee = async (req, res) => {
  try {
    const { name, mobile, role } = req.body;

    const employee = await Employee.create({
      name,
      mobile,
      role
    });

    res.status(201).json({
      success: true,
      data: employee,
      message: "Your Employee has been created"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};


// ✅ 2️⃣ Get All Active Employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ✅ 3️⃣ Get Single Employee
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ✅ 4️⃣ Update Employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// ✅ 5️⃣ Soft Delete (Deactivate Employee)
export const deactivateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deactivated successfully",
      data: employee
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
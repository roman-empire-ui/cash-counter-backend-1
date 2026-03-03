import mongoose from "mongoose";

const { Schema, model } = mongoose;

const employeeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"]
    },

    role: {
      type: String,
      required: true,
      enum: ["Cashier", "Manager", "SalesStaff"]
    },

    allowedWeekOffs: {
      type: Number,
      default: 2,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// 🔥 Auto set weekoffs based on role
employeeSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    if (this.role === "Manager") {
      this.allowedWeekOffs = 0;
    } else {
      this.allowedWeekOffs = 2;
    }
  }
  next();
});

const Employee = model("Employee", employeeSchema);

export default Employee;
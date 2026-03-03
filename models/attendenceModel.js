import mongoose from 'mongoose'
const {Schema , model} = mongoose

const attendanceSchema = new Schema({
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
  
    date: {
      type: Date,
      required: true
    },
  
    status: {
      type: String,
      enum: ["Present", "Absent", "WeekOff", "LossOfPay"],
      required: true
    },
  
  
  }, { timestamps: true });
  
  attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

  const Attendance = model('Attendance' , attendanceSchema)

  export default Attendance
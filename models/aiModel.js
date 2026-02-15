import {mongoose} from 'mongoose'

const {Schema , model} = mongoose


const questionSchema = new Schema(
    {
      text: {
        type: String,
        required: true,
        trim: true,
      },
  
      category: {
        type: String,
        enum: [
          "WATER",
          "ELECTRICITY",
          "COURIER",
          "STAFF",
          "RENT",
          "INTERNET",
          "PERSONAL",
          "OTHER",
        ],
        required: true,
      },
  
      priority: {
        type: Number,
        default: 1, // lower = asked earlier
      },
  
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );
  
   const Question = model("Question", questionSchema);
   export default Question
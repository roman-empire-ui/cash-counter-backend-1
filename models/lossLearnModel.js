import mongoose from "mongoose";
const { Schema, model } = mongoose;

const lossSessionSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    lossAmount: {
      type: Number,
      required: true,
    },

    askedQuestions: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
        },
        answer: {
          type: String,
          enum: ["YES", "NO"],
        },
      },
    ],

    resolved: {
      type: Boolean,
      default: false,
    },

    resolvedBy: {
      type: String,
      default: null, // WATER / STAFF / UNKNOWN
    },
  },
  { timestamps: true }
);

const LossSession =  model("LossSession", lossSessionSchema);
export default LossSession

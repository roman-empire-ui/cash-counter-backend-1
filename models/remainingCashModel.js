// models/remainingCashModel.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const cashSchema = new Schema({
  denomination: { type: Number, required: true },
  count: { type: Number, required: true },
  total: { type: Number, required: true },
});

const companySchema = new Schema({
  name: { type: String, default: "" },
  paidAmount: { type: Number, default: 0 },
});

const remainingCashSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    notes: [cashSchema],
    coins: [cashSchema],
    cash: { type: Number, default: 0 },
    paytm: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    additional: { type: Number, default: 0 },
    openingBalance: { type: Number, default: 0 },
    totalRemainingCash: { type: Number, default: 0 },

    companies: [companySchema],
    posibleOfflineAmount: { type: Number, default: 0 },
    posibleOnlineAmount : {type : Number , default : 0},
    difference: { type: Number, default: 0 },
    otherPayments: { type: Number, default: 0 },
    netProfitLoss: { type: Number, default: 0 },

    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

const RemCash = model("RemCash", remainingCashSchema);

export default RemCash;

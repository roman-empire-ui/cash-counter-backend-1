import mongoose from 'mongoose';

const remainingCashSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  amountHave: {
    type: Number,
    required: true
  },
  stockEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  totalStockExpenses : {
    type : Number,
    required : true,
    default : 0,
  },
  remainingAmount: {
    type: Number,
    required: true
  },

  extraSources : {
    paytm : {type : Number , default : 0},
    company : [{
      name : {type : String , default : ''},
      amount : {type : Number , default : 0}
    }]
  }

}, {
  timestamps: true
});

export default mongoose.model('RemAmount', remainingCashSchema);

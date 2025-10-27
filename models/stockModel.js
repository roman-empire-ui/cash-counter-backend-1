import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const companySchema = new Schema({
    name : {type : String , required : true},
    amount : {type : Number , required : true}
})

const stockSchema = new Schema(
    {
        date: {
            type: Date,
            required: true,
            // unique: true, // Ensures only one entry per day
        },
        distributors: [
            {
                name: { type: String, required: true },
                totalPaid: { type: Number, required: true }
            }
        ],
        totalStockExpenses: { type: Number, required: true },

        paytm : {type: Number , default : 0},
        companies : {type : [companySchema] , default : []}
    },
    { timestamps: true }
);

const Stock = model('Stock', stockSchema);
export default Stock;
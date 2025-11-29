import mongoose from 'mongoose';
const { Schema, model } = mongoose;



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
                totalPaid: { type: Number, required: true },
                inv : [{type : String}]
            }
        ],
        totalStockExpenses: { type: Number, required: true },

        
       
    },
    { timestamps: true }
);

const Stock = model('Stock', stockSchema);
export default Stock;
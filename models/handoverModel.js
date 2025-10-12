import mongoose from 'mongoose'
const {Schema , model} = mongoose 


const counterHandOverSchema = new Schema({

    date : {type : String  , required : true},
    time: { type: String, default: new Date().toLocaleTimeString() },
    amountGiven: { type: Number, required: true },
    changeReturned: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    reason: { type: String, required: true, enum: ["courier","distributor","staff","other","water"] },
    givenTo: { type: String, default: "" },
    remarks: { type: String, default: "" },
    addedBy: { type: String, required : true },
}, {timestamps : true})

const Handover = model('Handover' , counterHandOverSchema)

export default Handover
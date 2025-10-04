import mongoose from 'mongoose'
const {model , Schema} = mongoose

const denomSchema = new Schema({
    denomination : {type : Number , required : true},
    count : {type : Number , required : true},
    total : {type : Number , required : true}
} , {_id : false})


const initialSchema = new Schema({
    date : {type : Date , required : true , unique : true},
    notes : [denomSchema],
    coins : [denomSchema],
    totalInitialCash : {type : Number , required : true}

}, {timestamps : true})


const Initial = model('Initial' , initialSchema) 
export default Initial
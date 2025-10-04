import mongoose  from 'mongoose' 

const {Schema , model} = mongoose 

const distributorSchema = new Schema({
  name : {
    type : String,
    required : true,
    unique : true
  }
} , {timestamps : true})

const Distributors = model('Distributors' , distributorSchema) 


export default Distributors;
import mongoose from 'mongoose'




const connectToDB = async (req , res) => {

    try {
         await mongoose.connect(process.env.MONGO_URI)
         console.log("Connected to Database")
    } catch (e) {
        console.log('Error while connectng to database', e)
       
    }
}

export default connectToDB;
import dotenv from 'dotenv'
dotenv.config()
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
export {sgMail}
import express from 'express'
import cors from 'cors'
import connectToDB from './db/config.js'
import adminRoutes from './routes/userRouter.js'
import stockRoutes from './routes/stockRouter.js'
import counterRoutes from './routes/counterRouter.js'
import distRoutes from './routes/distributorRouter.js'
import handRoutes from './routes/counterHanRouter.js'
import aiRouters from './routes/aiRouter.js'
 //import seedQuestions from './db/seedQuest.js'


//Using middlewares
const app = express()
app.use(express.json()) 


const corsOptions = {
    origin: ['https://cash-counter-frontend.vercel.app', 'http://localhost:5173'],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
  

app.use(cors(corsOptions))



//Port
const PORT  =  process.env.PORT ||  4000;


app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/stock' , stockRoutes)
app.use('/api/v1/counter' , counterRoutes)
app.use("/api/v1/dist", distRoutes);
app.use('/api/v1/speech',handRoutes)
app.use('/api/v1/ai', aiRouters)


//Connecting Database
connectToDB()
//  seedQuestions()



//Database connection
app.listen( PORT ,()=> {
    console.log(`Server running on port ${PORT}`)
})
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import connectToDB from './db/config.js'
import adminRoutes from './routes/userRouter.js'
import stockRoutes from './routes/stockRouter.js'
import counterRoutes from './routes/counterRouter.js'
import distRoutes from './routes/distributorRouter.js'

//Using middlewares
const app = express()
app.use(express.json()) 


const corsOptions = {
  origin: [
    /^https:\/\/cash-counter-frontend.*\.vercel\.app$/, // Regex to allow any preview URL
    "http://localhost:5173"
  ],
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
//Connecting Database
connectToDB()


//Database connection
app.listen( PORT ,()=> {
    console.log(`Server running on port ${PORT}`)
})
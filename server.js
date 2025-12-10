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
import { initWhatsApp, getQRCodeDataURL } from "./utils/whatsapp.js";

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

initWhatsApp()

app.get("/qr", (req, res) => {
  const qr = getQRCodeDataURL();
  if (!qr) return res.send("QR not generated yet. Wait 5 seconds...");

  res.send(`
    <div style="text-align:center; font-family:Arial;">
      <h2>Scan this QR with WhatsApp</h2>
      <img src="${qr}" style="width:300px;"/>
      <p>Open WhatsApp → Linked Devices → Scan QR</p>
    </div>
  `);
});
//Connecting Database
connectToDB()


//Database connection
app.listen( PORT ,()=> {
    console.log(`Server running on port ${PORT}`)
})
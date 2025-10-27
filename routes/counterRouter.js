import express from 'express'
import { getInitialCash, initialCounter } from '../controllers/counterCon.js'
import { getMonthlyProfitLoss, getRemainingCash, saveRemainingCash } from '../controllers/remCash.js'



const app = express.Router()



app.post('/initialCount',   initialCounter)
app.post('/remCash', saveRemainingCash)
app.get('/getInitial',  getInitialCash)
app.get('/getRemainingCash',   getRemainingCash)
app.get('/monthly-summary' , getMonthlyProfitLoss)



export default app
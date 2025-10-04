import express from 'express'
import { getInitialCash, initialCounter } from '../controllers/counterCon.js'
import { getRemainingCash, saveRemainingCash } from '../controllers/remCash.js'



const app = express.Router()



app.post('/initialCount',   initialCounter)
app.post('/remCash', saveRemainingCash)
app.get('/getInitial',  getInitialCash)
app.get('/getRemainingCash',   getRemainingCash)



export default app
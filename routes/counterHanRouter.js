import express from 'express'
import { createHandOver, deleteHandOver, getHandoverList } from '../controllers/handoverCon.js'
import AuthUser from '../middlewares/Auth.js'


const app = express.Router() 


app.post('/createHandover' ,AuthUser , createHandOver)
app.get('/getHandover' , getHandoverList)
app.delete('/deleteHand/:id' , deleteHandOver)


export default app
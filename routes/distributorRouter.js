import express from 'express'
import { createDist,  searchDistributor } from '../controllers/distCon.js'



const app = express.Router()



app.post('/createDist' , createDist)
app.get('/searchDist' , searchDistributor)


export default app
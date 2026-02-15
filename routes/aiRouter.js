import express from 'express'
import { answerQuestion, getNextQuestion, getTodayLossSession } from '../controllers/lossAiCon.js'



const app = express.Router()


app.get('/session' , getTodayLossSession)
app.get('/question/:sessionId' , getNextQuestion)
app.post('/answer/:sessionId' , answerQuestion)




export default app
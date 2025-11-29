import express from 'express'
import { deleteDistributor, getAllStocks, getRemAmt, getRemAmts, getStockByDate, getStockByDistrubutor, getStocks, remAmt, stockEntry, updateStock } from '../controllers/stockCon.js';
import AuthUser from '../middlewares/Auth.js';

const app = express.Router() 




app.post('/stockEntry' , AuthUser, stockEntry)
app.get('/getStock' , AuthUser, getStockByDistrubutor)
app.get('/allStocks' ,  getAllStocks)
app.put('/updateStock/:stockId/:distributorId', AuthUser, updateStock)
app.delete('/deleteDist/:stockId/:distributorId' , AuthUser, deleteDistributor )
app.get('/getStocks', AuthUser, getStocks)
app.post('/remAmount' , AuthUser, remAmt)
app.get("/getRemAmount/:stockEntryId", AuthUser, getRemAmt);
app.get('/get-rem-amounts' , getRemAmts)
app.get('/stock-by-date' , getStockByDate)
// app.put('/updateAmountHave/:stockEnId' , updateRemAmount)

export default app;
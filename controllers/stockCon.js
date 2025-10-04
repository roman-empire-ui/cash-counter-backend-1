import { TryCatch } from "../middlewares/errors.js";
import RemAmount from "../models/remAmtModel.js";
import Stock from "../models/stockModel.js"

export const stockEntry = TryCatch(async (req, res) => {
  const { date, distributors } = req.body;

  if (!date || !distributors || distributors.length === 0) {
    return res.status(400).json({ success: false, message: "Date and distributors are required." });
  }

  const inputDate = new Date(date);
  const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

  // Check if stock entry already exists for this day
  const existingEntry = await Stock.findOne({
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  const totalExpense = distributors.reduce((sum, d) => sum + Number(d.totalPaid || 0), 0);

  if (existingEntry) {
    // Append new distributors to existing entry
    existingEntry.distributors.push(...distributors);
    existingEntry.totalStockExpenses += totalExpense;

    await existingEntry.save();

    return res.status(200).json({
      success: true,
      message: 'Stock entry updated successfully.',
      data: existingEntry
    });
  }

  // If no entry exists for the day, create a new one
  const newEntry = await Stock.create({
    date: inputDate, // Save current time
    distributors,
    totalStockExpenses: totalExpense
  });

  return res.status(201).json({
    success: true,
    message: 'Stock entry created successfully.',
    data: newEntry
  });
});


  

export const getStockByDistrubutor = async (req , res) => {

    try {
        const {name} = req.query

        if(!name) {
            return res.status(400).json({error : 'Please provide distributor name'})
        }

        const stocks = await Stock.find({'distributors.name' : {$regex : new RegExp(name , 'i')}})

        if(stocks.length === 0) {
            return res.status(404).json({error : 'No stock entry found for this distributor'})
        }

       const filteredStocks = stocks.map(stock => {
        const matchedMap = stock.distributors.filter(d=>
            d.name.toLowerCase().includes(name.toLowerCase())
        )

        return {
            date : stock.date,
            distributors : matchedMap ,
        }
       })

        res.status(201).json({stocks : filteredStocks})

    } catch(e) {
        console.log('error occured' , e)
        res.status(500).json({error : 'Internal server error'})
    }
}

export const getAllStocks = TryCatch(async(req , res , next) => {
    const getAllStocks = await Stock.find().sort({date : -1})
    res.status(201).json({ success : true , data : getAllStocks})
})

export const getStocks = TryCatch(async(req , res , next) => {
    const today  = new Date() 
    today.setUTCHours(0,0,0,0)
    const stockEntry = await Stock.find({date : today})
    if(!stockEntry) {
        res.json({success : true , data:[], message : 'No Stock Entry for today'})
    }

    res.json({success : true , data:[stockEntry]})
})


export const updateStock = async (req, res) => {
    try {
        const { stockId, distributorId } = req.params; // Get stock entry ID and distributor ID
        const { name, totalPaid } = req.body; // Updated values

        const stockEntry = await Stock.findById(stockId);
        if (!stockEntry) {
            return res.status(404).json({success : false,  message: 'Stock entry not found' });
        }

        // Find distributor inside the stock entry
        const distributor = stockEntry.distributors.find(d => d._id.toString() === distributorId);
        if (!distributor) {
            return res.status(404).json({success : false, message: 'Distributor not found' });
        }

        // Update distributor details
        if (name) distributor.name = name;
        if (totalPaid !== undefined) distributor.totalPaid = totalPaid;

        // Recalculate totalStockExpenses
        stockEntry.totalStockExpenses = stockEntry.distributors.reduce((sum, d) => sum + d.totalPaid, 0);

        await stockEntry.save();

        res.status(200).json({success : true,  message: 'Distributor updated successfully', stockEntry });

    } catch (e) {
        console.error('Error:', e);
        res.status(500).json({success : false, message: 'Internal server error' });
    }
};

export const deleteDistributor = async(req , res) =>{
    try{

        const {stockId , distributorId} = req.params

        const stockEntry = await Stock.findById(stockId)
        if(!stockEntry){
            return res.status(404).json({error : 'Stock entry not found'})
        }
        const distToDelete = await stockEntry.distributors.find(d => d._id.toString() === distributorId)
        if(!distToDelete){
            return res.status(404).json({error : 'Distributor not found'})
        }

        stockEntry.distributors = stockEntry.distributors.filter(d => d._id.toString() !== distributorId)
        stockEntry.totalStockExpenses -= distToDelete.totalPaid
        await stockEntry.save() 
        res.status(201).json({ success : true, message : 'Distributor deleted successfully', stockEntry})
    } catch (e) {
        console.log(e) 
        res.status(500).json({error: 'Internal server error'})
    }
}


export const remAmt =async (req, res) => {
  try {
    const { date, amountHave, stockEntryId, extraSources } = req.body;

    const stockEntry = await Stock.findById(stockEntryId);
    if (!stockEntry) {
      return res.status(404).json({ success: false, message: 'Stock entry not found' });
    }

    const totalExpense = stockEntry.totalStockExpenses;
    const extraTotal = (extraSources?.pincode || 0) + (extraSources?.paytm || 0) + (extraSources?.companies?.reduce((sum , c) => sum + Number(c.amount || 0) ,0) || 0)
    const remainingAmount = Number(amountHave) + extraTotal - Number(totalExpense);

    // ✅ Check if entry for the date exists
    const existing = await RemAmount.findOne({ date: new Date(date) });

    if (existing) {
      // ✅ Update existing
      existing.amountHave = amountHave;
      existing.remainingAmount = remainingAmount;
      existing.stockEntry = stockEntryId;
      existing.extraSources = extraSources || {}
      await existing.save();
      return res.status(200).json({ success: true, message: 'Updated successfully', data: existing });
    } else {
      // ✅ Insert new
      const newEntry = await RemAmount.create({
        date: new Date(date),
        amountHave,
        remainingAmount,
        stockEntry : stockEntryId,
        extraSources : extraSources || {}

      });
      return res.status(201).json({ success: true, message: 'Created successfully', data: newEntry });
    }
  } catch (error) {
    console.error('Error in calRem:', error);
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
};


  export const getRemAmt = async (req, res) => {
    try {
      const { stockEntryId } = req.params;
  
      // First, validate stockEntryId
      const stockE = await Stock.findById(stockEntryId);
      if (!stockE) {
        return res.status(404).json({ error: 'Stock entry not found' });
      }
  
      // Now fetch the remaining amount related to this stock entry
      const remData = await RemAmount.findOne({ stockEntry: stockEntryId });
  
      if (!remData) {
        return res.status(404).json({ success: false, message: 'Remaining amount not found for this stock entry' });
      }
  
      res.status(200).json({ success: true, data: remData });
    } catch (e) {
      console.log('error', e);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };
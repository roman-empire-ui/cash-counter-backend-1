// controllers/remainingCashController.js
import RemCash from "../models/remainingCashModel.js";
import LossSession from "../models/lossLearnModel.js";



const upsertLossSession = async (entryDate, netPL) => {
  if (netPL > 0) {
    const existing = await LossSession.findOne({ date: entryDate });

    if (!existing) {
      await LossSession.create({
        date: entryDate,
        lossAmount: netPL,
      });
    } else {
      existing.lossAmount = netPL;
      await existing.save();
    }
  } else {
    await LossSession.findOneAndUpdate(
      { date: entryDate },
      { resolved: true, resolvedBy: "NO_LOSS" }
    );
  }
};



export const saveRemainingCash = async (req, res) => {
  try {
    // debugging helper: uncomment if you need to inspect what frontend sends
    console.log("[saveRemainingCash] body:", JSON.stringify(req.body));

    const {
      date,
      notes,
      coins,
      remarks,
      paytm,
      card,
      additional,
      openingBalance,
      companies,
      posibleOfflineAmount,
      posibleOnlineAmount,
      otherPayments,
    } = req.body;

    // Normalize date
    const entryDate = new Date(date);
    entryDate.setUTCHours(0, 0, 0, 0);

    // Clean notes and coins
    const validNotes = (notes || []).map((n) => ({
      denomination: Number(n.denomination),
      count: Number(n.count) || 0,
      total: (Number(n.denomination) || 0) * (Number(n.count) || 0),
    }));

    const validCoins = (coins || []).map((c) => ({
      denomination: Number(c.denomination),
      count: Number(c.count) || 0,
      total: (Number(c.denomination) || 0) * (Number(c.count) || 0),
    }));

    // Physical cash
    const totalCash = [...validNotes, ...validCoins].reduce(
      (sum, item) => sum + item.total,
      0
    );

    // Companies paid (normalize)
    const validCompanies = (companies || []).map((c) => ({
      name: c.name || "",
      paidAmount: Number(c.paidAmount ?? c.paid ?? c.amount) || 0,
    }));

    const totalCompanyPayments = validCompanies.reduce(
      (sum, c) => sum + (c.paidAmount || 0),
      0
    );

    // Total from digital + extra - opening balance - company payments
    const totalRemainingCash =
      totalCash +
      totalCompanyPayments +
      (Number(paytm) || 0) +
      (Number(card) || 0) +
      (Number(additional) || 0) -
      (Number(openingBalance) || 0);

    // Difference and net P/L
    const diff =
      (Number(posibleOfflineAmount) || 0) - totalRemainingCash;
    const netPL = diff - (Number(otherPayments) || 0);

    // Check existing
    let existing = await RemCash.findOne({ date: entryDate });

    if (existing) {
      existing.notes = validNotes;
      existing.coins = validCoins;
      existing.cash = totalCash;
      existing.paytm = Number(paytm) || 0;
      existing.card = Number(card) || 0;
      existing.additional = Number(additional) || 0;
      existing.openingBalance = Number(openingBalance) || 0;
      existing.totalRemainingCash = totalRemainingCash;
      existing.companies = validCompanies;
      existing.posibleOfflineAmount =
        Number(posibleOfflineAmount) || 0;
      existing.posibleOnlineAmount =
        Number(posibleOnlineAmount) || 0;
      existing.difference = diff;
      existing.otherPayments = Number(otherPayments) || 0;
      existing.netProfitLoss = netPL;
      existing.remarks = remarks || "";

      await existing.save();
      await upsertLossSession(entryDate, diff);


      return res.status(200).json({
        success: true,
        message: "Remaining cash updated for this date",
        remainingCash: existing,
      });
    }

    // New entry
    const newEntry = new RemCash({
      date: entryDate,
      notes: validNotes,
      coins: validCoins,
      cash: totalCash,
      paytm: Number(paytm) || 0,
      card: Number(card) || 0,
      additional: Number(additional) || 0,
      openingBalance: Number(openingBalance) || 0,
      totalRemainingCash,
      companies: validCompanies,
      posibleOfflineAmount: Number(posibleOfflineAmount) || 0,
      posibleOnlineAmount: Number(posibleOnlineAmount) || 0,
      difference: diff,
      otherPayments: Number(otherPayments) || 0,
      netProfitLoss: netPL,
      remarks: remarks || "",
    });

    await newEntry.save();
    await upsertLossSession(entryDate, diff);

    return res.status(201).json({
      success: true,
      message: "Remaining cash saved for this date",
      remainingCash: newEntry,
    });
  } catch (e) {
    console.error("[saveRemainingCash error]", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message,
    });
  }
};
;



export const getRemainingCash = async (req, res) => {
  try {
    const { date } = req.query;

    if (date) {
      const entryDate = new Date(date);
      entryDate.setUTCHours(0, 0, 0, 0);

      const entry = await RemCash.findOne({ date: entryDate });
      if (!entry) {
        return res.status(404).json({ message: "No data found for this date" });
      }
      return res.status(200).json({ message: "Data found", data: entry });
    }

    const allEntries = await RemCash.find().sort({ date: -1 });
    return res.status(200).json(allEntries);
  } catch (e) {
    console.error("[getRemainingCash error]", e);
    return res.status(500).json({ message: "Internal server error", error: e.message });
  }
};





// ✅ Get Monthly Profit/Loss Summary
export const getMonthlyProfitLoss = async (req, res) => {
  try {
    let { month, year } = req.query;

    // If not provided → current month
    const now = new Date();
    const selectedMonth = month ? Number(month) - 1 : now.getMonth();
    const selectedYear = year ? Number(year) : now.getFullYear();

    // Start and end of month
    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

    // Fetch remaining cash entries for that month
    const entries = await RemCash.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    if (!entries.length) {
      return res.status(404).json({
        success: false,
        message: `No remaining cash data found for ${selectedMonth + 1}/${selectedYear}`,
      });
    }

    // Calculate total profit and loss from the "difference" field
    let totalProfit = 0;
    let totalLoss = 0;

    entries.forEach((entry) => {
      const diff = entry.difference || 0;

      if (diff < 0) {
        // negative difference means profit
        totalProfit += Math.abs(diff);
      } else if (diff > 0) {
        // positive difference means loss
        totalLoss += diff;
      }
    });

    const netTotal = totalProfit - totalLoss;

    res.status(200).json({
      success: true,
      month: selectedMonth + 1,
      year: selectedYear,
      totalProfit,
      totalLoss,
      netTotal,
      entriesCount: entries.length,
    });
  } catch (err) {
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


export const getRemDataByRange = async(req, res) =>{

  try {
    const {from , to} = req.query 
    if(!from || !to) {
      return res.status(400).json({message : 'From and to must be provided'})
    }

    const startDate = new Date(from)
    const endDate = new Date(to)

    startDate.setUTCHours(0,0,0,0)
    endDate.setUTCHours(23 , 59 , 59 , 999)

    const entries = await RemCash.find({
      date : {$gte : startDate , $lte : endDate}
    }).sort({date : -1})

    if(!entries || entries.length === 0) {
      return res.status(404).json({success : false , message : 'No data found in this date range'})
    }

    return res.status(200).json({success: true , data : entries})
  } catch (e) {
    console.log('error' , e)
    res.status(500).json({success : false , message : 'Internal server error'})
  }
} 




import Initial from "../models/cashModel.js";






export const initialCounter = async (req, res) => {
    try {

        const { date, notes, coins } = req.body


        const entryDate = date ? new Date(date) : new Date()

        if (!date) {
            entryDate.setDate(entryDate.getDate() + 1)
        }

        entryDate.setUTCHours(0, 0, 0, 0)


        const calculatedNotes = notes.map(item => ({
            denomination: item.denomination,
            count: item.count,
            total: item.denomination * item.count,
        }))

        const calculatedCoins = coins.map(item => ({
            denomination: item.denomination,
            count: item.count,
            total: item.denomination * item.count,
        }))

        const totalCash = [...calculatedNotes, ...calculatedCoins].reduce((sum, item) => sum + item.total, 0)

        const existing = await Initial.findOne({ date: entryDate })
        if (existing) {
            existing.notes = calculatedNotes
            existing.coins = calculatedCoins
            existing.totalInitialCash = totalCash
            await existing.save()

            return res.status(201).json({
                success: true,
                message: 'Initial Cash updated for this date',
                initialCash: existing
            })
        }

        const newInitial = new Initial({
            date: entryDate,
            notes: calculatedNotes,
            coins: calculatedCoins,
            totalInitialCash: totalCash
        })

        await newInitial.save()

        res.status(201).json({
            success: true,
            message: 'Initial Cash saved for tomorrow',
            initialCash: newInitial
        })

    } catch (e) {
        console.log('error occured', e)
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        })
    }
}


export const getInitialCash = async (req, res) => {
    try {
        const { date } = req.query
        const targetDate = date ? new Date(date) : new Date()
        targetDate.setUTCHours(0, 0, 0, 0)

        const initial = await Initial.findOne({ date: targetDate })
        if (!initial) {
            return res.status(404).json({
                success: false,
                message: 'No Initial Cash Added on this date'
            })
        }


        return res.status(201).json({
            success: true,
            message: 'Initial Cash fetched',
            initialCash: initial
        })

    } catch (e) {
        console.log('error', e)
        res.status(500).json({ status: false, message: 'Internal server error' })
    }
}


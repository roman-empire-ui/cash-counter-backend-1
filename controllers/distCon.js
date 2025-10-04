import Distributors from "../models/distributorModel.js";

export const createDist = async (req, res) => {
  try {
    let { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Distributor name is required" });
    }

    name = name.trim().toLowerCase();

    let distributor = await Distributors.findOne({ name });
    if (distributor) {
      // ✅ Exists → just return without "message"
      return res.status(200).json({
        success: true,
        data: distributor,
        isNew: false,
      });
    }

    distributor = await Distributors.create({ name });

    res.status(201).json({
      success: true,
      data: distributor,
      isNew: true, // ✅ Only mark new here
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



// distributorController.js

export const searchDistributor = async (req, res) => {
  try {
    const { query } = req.query; // frontend sends ?query=retail
    if (!query) {
      return res.json({ success: true, data: [] });
    }

    const distributors = await Distributors.find({
      name: { $regex: query, $options: "i" } // "i" = case insensitive
    }).limit(10); // limit to 10 suggestions

    res.json({ success: true, data: distributors.map(d => d.name) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

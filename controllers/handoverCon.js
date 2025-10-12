import Handover from "../models/handoverModel.js"
import Admin from "../models/userModel.js"







export const createHandOver = async(req , res) => {
    try {

        const {amountGiven, changeReturned = 0, reason, givenTo = "", remarks = ""} = req.body

        if (amountGiven === undefined || reason === undefined || reason === "") {
            return res.status(401).json({success: false, message: 'Amount and Reason must be provided'});
          }

        const admin = await Admin.findById(req.user.id)
        if(!admin) return res.status(401).json({success : false , message : 'Admin not found'})
        
        const netAmount = amountGiven - changeReturned

        const creatingHandover = await Handover.create({
            date : new Date().toISOString().split('T')[0],
            time : new Date().toLocaleString(),
            amountGiven,
            changeReturned,
            netAmount,
            reason,
            givenTo,
            remarks,
            addedBy : admin.name
        })
        // console.log(creatingHandover)
        res.status(201).json({success : true , message : 'Counter handover has been recorded', data : creatingHandover})

    } catch(e){
        console.log('error', e)
        return res.status(500).json({success : false , message : 'Internal server error'})
    }
}





export const getHandoverList = async (req, res) => {
  try {
    const hands = await Handover.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({success : true , message : 'Fetched' , data : hands})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching handovers", error: err.message });
  }
};




export const deleteHandOver = async (req, res) => {
  try {
    const { id } = req.params; // get the id from the URL (e.g. /api/v1/handover/delete/:id)

    if (!id) {
      return res.status(400).json({ success: false, message: "Handover ID is required" });
    }

    const handover = await Handover.findByIdAndDelete(id);

    if (!handover) {
      return res.status(404).json({ success: false, message: "Handover not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Handover deleted successfully",
      data: handover,
    });
  } catch (error) {
    console.error("Delete Handover Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting handover",
    });
  }
};

import Resident from "../models/Resident.js"
import Block from "../models/Block.js";


export const getBlocks = async (req, res) => {
    try {
        const blocks = await Block.find()
        .populate({
          path: "resident",
          select: "residentId userId",
          populate: {
            path: "userId",
            select: "name"
          }
        })
        .populate("visitor", "fullName")
        .populate("blockedBy", "name");
      
  
      return res.status(200).json({ success: true, blocks });
    } catch (error) {
      console.error("get Blocks error:", error);
      return res.status(500).json({ success: false, error: "get blocks server error" });
    }
  };
  

export const unblockResident = async (req,res) =>{
    try {
        const {id} = req.params;
        //console.log("******",id)
        const deleteBlock = await Block.findById({_id: id})
        await deleteBlock.deleteOne()  
        
        if (!deleteBlock) {
            return res.status(404).json({ success: false, error: "Block not found" });
        }
        return res.status(200).json({success: true, deleteBlock})
    } catch (error) {
        return res.status(500).json({success: false,error: "delete Block server error"})
    }
}
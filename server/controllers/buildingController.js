import Building from "../models/Building.js";

// In buildingController.js
export const getBuilding = async (req, res) => {
    try {
      const building = await Building.findOne();
      res.status(200).json({ success: true, building });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch building" });
    }
  };
  
  export const updateBuilding = async (req, res) => {
    try {
      const updated = await Building.findOneAndUpdate({}, req.body, { new: true });
      res.status(200).json({ success: true, building: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: "Failed to update building" });
    }
  };
  
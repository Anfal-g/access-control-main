import Apartment from "../models/Apartment.js"
import Resident from "../models/Resident.js"
import Building from "../models/Building.js";

export const getApartments = async (req, res) => {
    try {
      const apartments = await Apartment.find();
  
      const enriched = await Promise.all(
        apartments.map(async (aprt) => {
          // Get all residents for this apartment
          const residents = await Resident.find({ apartment: aprt._id }).populate('userId');
  
          // Count total residents
          const totalResidents = residents.length;
  
          // Get the owner
          const ownerResident = residents.find(res => res.residentType === 'owner');
          const ownerName = ownerResident && ownerResident.userId ? ownerResident.userId.name : "N/A";
  
          return {
            _id: aprt._id,
            apartment_name: aprt.apartment_name,
            totalResidents,
            owner: ownerName,
          };
        })
      );
  
      return res.status(200).json({ success: true, apartments: enriched });
  
    } catch (error) {
      console.error("getApartments error:", error);
      return res.status(500).json({ success: false, error: "get apartments server error" });
    }
  };


  export const addApartment = async (req, res) => {
    try {
      const { apartment_name, description } = req.body;
  
      // Retrieve the building configuration
      const building = await Building.findOne();
      if (!building) {
        return res.status(400).json({ success: false, error: "Building configuration not found." });
      }
  
      // Count existing apartments
      const apartmentCount = await Apartment.countDocuments();
  
      if (apartmentCount >= building.numberOfApartments) {
        return res.status(400).json({ success: false, error: "Maximum number of apartments reached." });
      }
  
      // Proceed to add the new apartment
      const newApartment = new Apartment({ apartment_name, description });
      await newApartment.save();
  
      return res.status(200).json({ success: true, apartment: newApartment });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server error while adding apartment." });
    }
  };

export const getApartment = async (req,res) => {
    try {
        const {id} = req.params;
        const apartment = await Apartment.findById({_id: id})
        return res.status(200).json({success: true, apartment})
    } catch (error) {
        return res.status(500).json({success: false,error: "edit apartment server error"})
    }
}
export const updateApartment = async (req,res) => {
    
    try {
        const {id} = req.params;
        // alert(id)
        // console.log("Received params:", req.params);
        const {apartment_name,description}= req.body
        const updateApartment = await Apartment.findByIdAndUpdate({_id: id},{apartment_name,description})
        return res.status(200).json({success: true, updateApartment})
    } catch (error) {
        // console.log(error)
        return res.status(500).json({success: false,error: "edit/update apartment server error"})
    }
}
export const deleteApartment = async (req,res) =>{
    try {
        const {id} = req.params;
        //console.log("******",id)
        const deleteAprt = await Apartment.findById({_id: id})
        //after find Apartment delete it 
        await deleteAprt.deleteOne()
        //const deleteAprt = await Apartment.findByIdAndDelete({_id: id})
       // const deleteAprt = await Apartment.findByIdAndDelete(id);
        
        if (!deleteAprt) {
            return res.status(404).json({ success: false, error: "Apartment not found" });
        }
        return res.status(200).json({success: true, deleteAprt})
    } catch (error) {
        return res.status(500).json({success: false,error: "delete Apartment server error"})
    }
}
// export default {addApartment}
import Apartment from "../models/Apartment.js";
import Contact from "../models/Contact.js";
import Resident from "../models/Resident.js";


const getSummary = async(req,res) => {
    try {
        //total of emp
        const totalResidents = await Resident.countDocuments();
        
        const totalApartments = await Apartment.countDocuments();

        const totalMessages = await Contact.countDocuments();

        // const totalSalaries = await Salary.aggregate([
        //     {$group:{_id: null, totalSalary: {$sum : "$salary"}}  } 
        //     // group fileds based on id bacause we don't have identifaier
        //     //null means that we would like to group all the documents
        //     //£salary means that it will select this salary from our model
        // ]) //aggregate pipeline is an array

        // const residentAppliedForLeave = await Leave.distinct('residentId')
        //  // the distinct = the uinique resident id
         
        // const leaveStatus = await Leave.aggregate([
        //     {$group: {
        //         _id: "$status",
        //         count: {$sum: 1}
        //     }}
        // ])
        //group based on status

        // const leaveSummary ={
        //     sucess:true,
        //     appliedFor: residentAppliedForLeave.length,
        //     approved: leaveStatus.find(item => item._id === "Approved")?.count || 0, 
        //     rejected: leaveStatus.find(item => item._id === "Rejected")?.count || 0, 
        //     pending: leaveStatus.find(item => item._id === "Pending")?.count || 0, 
            
        // }
        return res.status(200).json({
            totalResidents,
            totalApartments,
            totalMessages,
            // totalSalary: totalSalaries[0]?.totalSalary || 0,
            // leaveSummary
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ sucess:false, error:"dashboard summary error"})
    }
}

export {getSummary};
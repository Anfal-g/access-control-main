import Building from "../models/Building.js";
import Resident from "../models/Resident.js"
import Visitor from "../models/Visitor.js"
import Block from "../models/Block.js"
import { generateVisitorId } from '../utils/generateVisitorId.js';
import QRCode from "qrcode";
import EntryLog from "../models/EntryLog.js";
import cron from 'node-cron';
import invoke from '../../../BasicNetwork-2.0-master/api-2.0/app/invoke.js';

cron.schedule('*/1 * * * *', async () => {
  //console.log("Cron job executed at:", new Date());
  
  try {
    const now = new Date();
  //  console.log("Checking for expired blocks at:", now);

    // Find all expired blocks and populate the visitor reference
    const expiredBlocks = await Block.find({ toDateTime: { $lt: now } })
      .populate('visitor'); // Add this population

  //  console.log(`Found ${expiredBlocks.length} expired blocks`);

    for (const block of expiredBlocks) {
  //    console.log("Processing block for visitor:", block.visitor?._id);
      
      // Check if population worked
      if (!block.visitor || typeof block.visitor === 'string') {
   //     console.log("Visitor reference not properly populated, manual lookup needed");
        const visitor = await Visitor.findById(block.visitor);
        if (!visitor) {
     //     console.log("Visitor not found by ID, skipping");
          continue;
        }
        block.visitor = visitor; // Replace reference with full document
      }

      const resident = await Resident.findById(block.visitor.resident);

      if (!resident) {
        console.log("Resident not found, skipping");
        continue;
      }

      // Call the chaincode to unblock the visitor
      const args = [block.visitor.visitorId, resident.residentId];
      console.log("Invoking blockchain with args:", args);
      
      const response = await invoke.invokeTransaction(
        "residentschannel",
        "residentManagement",
        "UnblockVisitor",
        args,
        resident.residentId,
        "Org1"
      );
      
      console.log("Blockchain response:", response);

      // Remove the block from MongoDB
      await block.deleteOne();
      console.log(`✅ Automatically unblocked visitor ${block.visitor.visitorId}`);
    }
  } catch (err) {
    console.error("❌ Block cleanup failed:", err);
  }
});

export const addVisitor = async (req, res) => {
  const visitorId = generateVisitorId();
  const qrData = visitorId;
  const qrImagePath = `public/qrcodes/visitors/${visitorId}.png`;

  try {
    const {
      fullName,
      phone,
      visitTimeFrom,
      visitTimeTo,
      relationship,
      residentId
    } = req.body;

    // 1. MongoDB Validations
    const existingVisitorByPhone = await Visitor.findOne({ phone });
    if (existingVisitorByPhone) {
      return res.status(400).json({ success: false, error: "Phone number already registered" });
    }

    const building = await Building.findOne();
    if (!building) {
      return res.status(500).json({ success: false, error: "Building configuration not found" });
    }

    let resident;
    if (residentId) {
      resident = await Resident.findById(residentId);
    } else {
      resident = await Resident.findOne({ userId: req.user._id });
    }

    if (!resident) {
      return res.status(404).json({ success: false, error: "Resident not found" });
    }

    const currentVisitorCount = await Visitor.countDocuments({ resident: resident._id });
    if (currentVisitorCount >= building.maxVisitorsPerResident) {
      return res.status(400).json({
        success: false,
        error: "Maximum number of visitors for this resident reached",
      });
    }

    // 2. Generate QR Code
    await QRCode.toFile(qrImagePath, qrData);

    // 3. Create and save visitor in MongoDB
const newVisitor = new Visitor({
  visitorId,
  fullName,
  phone,
  visitTimeFrom,
  visitTimeTo,
  relationship,
  resident: resident._id,
  residentId: resident.residentId, // Add this line
  qrCodeData: qrData,
  qrCodeImage: `${visitorId}.png`
});


    await newVisitor.save();

    // 4. Update resident in MongoDB
    resident.visitors.push(newVisitor._id);
    await resident.save();

    // 5. Invoke chaincode to store in CouchDB
    const channelName = "residentschannel";
    const chaincodeName = "residentManagement";
    const fcn = "AddVisitor";
    const username = resident.residentId; // Using resident's ID for Fabric
    const orgName = "Org1";

    const args = [
      resident.residentId, // args[0] - ResidentID
      visitorId,           // args[1] - VisitorID
      fullName,            // args[2] - FullName
      phone,               // args[3] - Phone
      visitTimeFrom,       // args[4] - VisitTimeFrom
      visitTimeTo,         // args[5] - VisitTimeTo
      relationship,         // args[6] - Relationship
    ];
     // Enroll user if needed
      //await helper.getRegisteredUser(username, orgName, 'resident', true);

   try {
  const fabricResponse = await invoke.invokeTransaction(
    channelName,
    chaincodeName,
    fcn,
    args,
    username,
    orgName
  );

  console.log("✅ Fabric transaction response (raw):", fabricResponse);

  const parsedFabricResult = fabricResponse.result
    ? JSON.parse(fabricResponse.result.toString())
    : fabricResponse.payload
      ? JSON.parse(fabricResponse.payload.toString())
      : {};

  return res.status(200).json({ 
    success: true, 
    message: "Visitor created successfully in both systems",
    visitorId,
    fabricResponse: parsedFabricResult
  });

} catch (fabricError) {
  console.error("❌ Failed to add visitor to Fabric:", fabricError);
      
      // Compensating transaction - remove from MongoDB if Fabric fails
      await Visitor.deleteOne({ _id: newVisitor._id });
      await Resident.updateOne(
        { _id: resident._id },
        { $pull: { visitors: newVisitor._id } }
      );

      return res.status(500).json({ 
        success: false, 
        error: "Visitor created in database but failed on blockchain",
        details: fabricError.message 
      });
    }

  } catch (error) {
    console.error("Error adding visitor:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Server error in adding visitor",
      details: error.message 
    });
  }
};
  
export const getVisitors = async (req, res) => {
  try {
    // Assuming `id` is the userId
    // console.log("req.params.id", req.params.id);

    // Step 1: Find the Resident using the userId (from req.params.id)
    const resident = await Resident.findOne({ userId: req.params.id }).populate('visitors');

    if (!resident) {
      return res.status(404).json({ success: false, message: "Resident not found" });
    }

    // console.log("Resident found:", resident);

    // Step 2: Fetch the visitors associated with this resident
    const visitors = resident.visitors;

    // Step 3: Add status to each visitor
    const visitorsWithStatus = await Promise.all(
      visitors.map(async (visitor) => {
        let isBlocked = await Block.findOne({ visitor: visitor._id });
    
        // ⏱ Check for expiry
        if (isBlocked && new Date(isBlocked.toDateTime) < new Date()) {
          await isBlocked.deleteOne(); // Automatically unblock
          isBlocked = null; // Set to null after deleting
        }
    
        return {
          ...visitor.toObject(),
          status: isBlocked ? "Blocked" : "Active",
        };
      })
    );
    

    // Step 4: Return the visitors list with status
    return res.status(200).json({ success: true, visitors: visitorsWithStatus });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "get visitors server error" });
  }
};


export const deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the visitor
    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ success: false, error: "Visitor not found" });
    }

    // Delete entry logs related to this visitor
    await EntryLog.deleteMany({ visitor: visitor._id });
    await Block.deleteMany({ visitor: visitor._id });

    // Delete the visitor
    await visitor.deleteOne();

    // Remove from resident's visitors array
    await Resident.updateOne(
      { visitors: visitor._id },
      { $pull: { visitors: visitor._id } }
    );

    return res.status(200).json({ 
      success: true, 
      message: "Visitor and associated entry logs deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting visitor:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to delete visitor" 
    });
  }
};


export const getVisitor = async (req,res)=>{
    // console.log("req.params.id", req.params.id);
    const {id} = req.params;
    // console.log("Visitor ID:", id)
    try {
        let visitor;
        visitor = await Visitor.findById({_id: id}) 

        return res.status(200).json({success: true, visitor})
    } catch (error) {
        return res.status(500).json({success: false,error: "get Visitor server error"})
    }
}

export const blockVisitor = async (req, res) => {
  const { id } = req.params;
  const { reason, from, fromTime, to, toTime } = req.body;

  try {
    // 1. Get visitor and associated resident
    const visitor = await Visitor.findById(id).populate('resident');
    if (!visitor) {
      return res.status(404).json({ success: false, error: "Visitor not found" });
    }

    if (!visitor.resident) {
      return res.status(400).json({ 
        success: false, 
        error: "Visitor is not associated with any resident" 
      });
    }

    const resident = visitor.resident;
    const fromDateTime = new Date(`${from}T${fromTime}`);
    const toDateTime = new Date(`${to}T${toTime}`);

    // 2. Check for existing block
    const existingBlock = await Block.findOne({ 
      $or: [
        { visitor: id },
        { resident: resident._id } // Also check by resident if needed
      ]
    });
    
    if (existingBlock) {
      return res.status(400).json({ 
        success: false, 
        error: "Visitor or resident already blocked." 
      });
    }

    // 3. Create block in MongoDB
    const blockEntry = new Block({
      visitor: id,
      resident: resident._id, // Add resident reference
      reason,
      blockedBy: req.user.id,
      fromDateTime,
      toDateTime
    });

    await blockEntry.save();

    // 4. Invoke chaincode
    const channelName = "residentschannel";
    const chaincodeName = "residentManagement";
    const fcn = "BlockVisitor";
    const username = resident.residentId;
    const orgName = "Org1";

    const args = [
      visitor.visitorId,    // args[0] - VisitorID
      resident.residentId,  // args[1] - ResidentID
      reason,               // args[2] - Reason
      from,                 // args[3] - FromDate
      fromTime,             // args[4] - FromTime
      to,                   // args[5] - ToDate
      toTime,               // args[6] - ToTime
      req.user.id           // args[7] - BlockedBy
    ];

    const fabricResponse = await invoke.invokeTransaction(
      channelName,
      chaincodeName,
      fcn,
      args,
      username,
      orgName
    );

    return res.status(200).json({ 
      success: true, 
      message: "Visitor blocked successfully in both systems"
    });

  } catch (error) {
    console.error("Error blocking Visitor:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Server error while blocking Visitor",
      details: error.message 
    });
  }
}
export const unblockVisitor = async (req, res) => {
  const { id } = req.params;

  try {
    const blockEntry = await Block.findOne({ visitor: id });
    if (!blockEntry) {
      return res.status(404).json({ success: false, error: "Block entry not found" });
    }

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ success: false, error: "Visitor not found" });
    }

    const resident = await Resident.findById(visitor.resident);
    if (!resident) {
      return res.status(404).json({ success: false, error: "Resident not found" });
    }

    // 1. Unblock in MongoDB
    await blockEntry.deleteOne();

    // 2. Invoke chaincode
    const channelName = "residentschannel";
    const chaincodeName = "residentManagement";
    const fcn = "UnblockVisitor";
    const username = resident.residentId;
    const orgName = "Org1";

    const args = [
      visitor.visitorId,    // args[0] - VisitorID
      resident.residentId   // args[1] - ResidentID
    ];

    const fabricResponse = await invoke.invokeTransaction(
      channelName,
      chaincodeName,
      fcn,
      args,
      username,
      orgName
    );

    return res.status(200).json({ 
      success: true, 
      message: "Visitor unblocked successfully in both systems"
    });

  } catch (error) {
    console.error("Error unblocking Visitor:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Server error while unblocking Visitor",
      details: error.message 
    });
  }
}

export const getVisitorsByResidentId = async (req, res) => {
  try {
    // Find the Resident by Resident _id 
    const resident = await Resident.findById(req.params.id).populate('visitors');

    if (!resident) {
      return res.status(404).json({ success: false, message: "Resident not found" });
    }

    const visitors = resident.visitors;

    // Step 3: Add status to each visitor
    const visitorsWithStatus = await Promise.all(
      visitors.map(async (visitor) => {
        let isBlocked = await Block.findOne({ visitor: visitor._id });
    
        // ⏱ Check for expiry
        if (isBlocked && new Date(isBlocked.toDateTime) < new Date()) {
          await isBlocked.deleteOne(); // Automatically unblock
          isBlocked = null; // Set to null after deleting
        }
    
        return {
          ...visitor.toObject(),
          status: isBlocked ? "Blocked" : "Active",
        };
      })
    );

    return res.status(200).json({ success: true, visitors: visitorsWithStatus });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "get visitors server error" });
  }
};

export const addVisitorByAdmin = async (req, res) => {
  const visitorId = generateVisitorId();
  const qrData = visitorId;
  const qrImagePath = `public/qrcodes/visitors/${visitorId}.png`;

  try {
    // 1. Validate and extract input
    const { fullName, phone, visitTimeFrom, visitTimeTo, relationship, residentId } = req.body;

    // 2. Check for existing visitor
    const existingVisitorByPhone = await Visitor.findOne({ phone });
    if (existingVisitorByPhone) {
      return res.status(400).json({ 
        success: false, 
        error: "Phone number already registered" 
      });
    }

    // 3. Get building configuration
    const building = await Building.findOne();
    if (!building) {
      return res.status(500).json({ 
        success: false, 
        error: "Building configuration not found" 
      });
    }

    // 4. Find resident (admin specifies residentId)
    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({ 
        success: false, 
        error: "Resident not found" 
      });
    }

    // 5. Check visitor quota
    const currentVisitorCount = await Visitor.countDocuments({ resident: resident._id });
    if (currentVisitorCount >= building.maxVisitorsPerResident) {
      return res.status(400).json({
        success: false,
        error: "Maximum number of visitors for this resident reached",
      });
    }

    // 6. Generate QR code
    try {
      await QRCode.toFile(qrImagePath, qrData);
    } catch (qrError) {
      console.error("QR generation failed:", qrError);
      return res.status(500).json({
        success: false,
        error: "Failed to generate QR code"
      });
    }

    // 7. Create and save visitor in MongoDB
    const newVisitor = new Visitor({
      visitorId,
      fullName,
      phone,
      visitTimeFrom,
      visitTimeTo,
      relationship,
      resident: resident._id,
      qrCodeData: qrData,
      qrCodeImage: `${visitorId}.png`
    });

    await newVisitor.save();

    // 8. Update resident's visitor list
    resident.visitors.push(newVisitor._id);
    await resident.save();

    // 9. Invoke chaincode to store in CouchDB
    const channelName = "residentschannel";
    const chaincodeName = "residentManagement";
    const fcn = "AddVisitor";
    const username = resident.residentId;
    const orgName = "Org1";

    const args = [
      resident.residentId, // ResidentID
      visitorId,           // VisitorID
      fullName,            // FullName
      phone,               // Phone
      visitTimeFrom,       // VisitTimeFrom
      visitTimeTo,         // VisitTimeTo
      relationship         // Relationship
    ];

    try {
      const fabricResponse = await invoke.invokeTransaction(
        channelName,
        chaincodeName,
        fcn,
        args,
        username,
        orgName
      );

      // Parse the response safely
      let parsedResponse = {};
      try {
        parsedResponse = fabricResponse.result 
          ? JSON.parse(fabricResponse.result.toString())
          : fabricResponse.payload
            ? JSON.parse(fabricResponse.payload.toString())
            : {};
      } catch (parseError) {
        console.error("Failed to parse Fabric response:", parseError);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Visitor created successfully in both systems",
        visitorId,
        visitor: newVisitor,
        fabricResponse: parsedResponse
      });

    } catch (fabricError) {
      console.error("Failed to add visitor to Fabric:", fabricError);
      
      // Compensating transaction
      await Visitor.deleteOne({ _id: newVisitor._id });
      await Resident.updateOne(
        { _id: resident._id },
        { $pull: { visitors: newVisitor._id } }
      );

      return res.status(500).json({ 
        success: false, 
        error: "Visitor created in database but failed on blockchain",
        details: fabricError.message 
      });
    }

  } catch (error) {
    console.error("Error adding visitor:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Server error in adding visitor",
      details: error.message 
    });
  }
};
// export const updateVisitor = async (req, res) => {
//   const { id } = req.params;
//   const { fullName, phone, visitTimeFrom, visitTimeTo, relationship } = req.body;

//   try {
//     const visitor = await Visitor.findById(id);
//     if (!visitor) {
//       return res.status(404).json({ success: false, error: "Visitor not found" });
//     }

//     visitor.fullName = fullName;
//     visitor.phone = phone;
//     visitor.visitTimeFrom = visitTimeFrom;
//     visitor.visitTimeTo = visitTimeTo;
//     visitor.relationship = relationship;

//     await visitor.save();

//     return res.status(200).json({ success: true, message: "Visitor updated successfully" });
//   } catch (error) {
//     console.error("Error updating Visitor:", error.message);
//     return res.status(500).json({ success: false, error: "Server error while updating Visitor" });
//   }
// }

export const updateVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone, visitTimeFrom, visitTimeTo } = req.body;

        // 1. Update in MongoDB
        const visitor = await Visitor.findById(id);
        if (!visitor) {
            return res.status(404).json({ success: false, error: "Visitor not found" });
        }

        const updatedVisitor = await Visitor.findByIdAndUpdate(
            id,
            { phone, visitTimeFrom, visitTimeTo },
            { new: true }
        );

        if (!updatedVisitor) {
            return res.status(404).json({ success: false, error: "Update failed" });
        }

        // 2. Update in CouchDB via chaincode
        const resident = await Resident.findById(visitor.resident);
        if (!resident) {
            return res.status(404).json({ success: false, error: "Resident not found" });
        }

        const channelName = "residentschannel";
        const chaincodeName = "residentManagement";
        const fcn = "UpdateVisitor";
        const username = resident.residentId;
        const orgName = "Org1";

        const args = [
            resident.residentId, // ResidentID
            visitor.visitorId,   // VisitorID
            phone,               // Phone
            visitTimeFrom,       // VisitTimeFrom
            visitTimeTo          // VisitTimeTo
        ];

        try {
            const fabricResponse = await invoke.invokeTransaction(
                channelName,
                chaincodeName,
                fcn,
                args,
                username,
                orgName
            );

            return res.status(200).json({ 
                success: true, 
                message: "Visitor updated successfully in both systems",
                visitor: updatedVisitor
            });

        } catch (fabricError) {
            console.error("❌ Failed to update visitor in Fabric:", fabricError);
            // Compensating transaction - revert MongoDB changes
            await Visitor.findByIdAndUpdate(
                id,
                {
                    phone: visitor.phone,
                    visitTimeFrom: visitor.visitTimeFrom,
                    visitTimeTo: visitor.visitTimeTo
                }
            );

            return res.status(500).json({ 
                success: false, 
                error: "Visitor updated in database but failed on blockchain",
                details: fabricError.message 
            });
        }

    } catch (error) {
        console.error("❌ update Visitor error:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Update Visitor server error",
            details: error.message 
        });
    }
};
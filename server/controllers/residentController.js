import Resident from "../models/Resident.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs";
import multer from "multer"
import path from "path";
import Building from "../models/Building.js"; 
import { generateResidentId } from '../utils/generateResidentId.js';
import QRCode from "qrcode";
import Block from '../models/Block.js'
import helper from '../../../BasicNetwork-2.0-master/api-2.0/app/helper.js';
import invoke from '../../../BasicNetwork-2.0-master/api-2.0/app/invoke.js';
import cron from 'node-cron';
cron.schedule('*/1 * * * *', async () => {
 // console.log("Resident unblock cron job executed at:", new Date());
  
  try {
    const now = new Date();
 //   console.log("Checking for expired resident blocks at:", now);

    // Find all expired blocks and populate the resident reference
    const expiredBlocks = await Block.find({ 
      toDateTime: { $lt: now },
      resident: { $exists: true } // Only blocks that have residents (not visitors)
    }).populate('resident'); // Populate the resident reference

   // console.log(`Found ${expiredBlocks.length} expired resident blocks`);

    for (const block of expiredBlocks) {
   //   console.log("Processing block for resident:", block.resident?._id);
      
      // Check if population worked
      if (!block.resident || typeof block.resident === 'string') {
    //    console.log("Resident reference not properly populated, manual lookup needed");
        const resident = await Resident.findById(block.resident);
        if (!resident) {
    //      console.log("Resident not found by ID, skipping");
          continue;
        }
        block.resident = resident; // Replace reference with full document
      }

      // Call the chaincode to unblock the resident
      const args = [block.resident.residentId];
      console.log("Invoking blockchain with args:", args);
      
      const response = await invoke.invokeTransaction(
        "residentschannel",
        "residentManagement",
        "UnblockResident",
        args,
        block.resident.residentId, // Using resident's own ID as username
        "Org1"
      );
      
      console.log("Blockchain response:", response);

      // Remove the block from MongoDB
      await block.deleteOne();
      console.log(`✅ Automatically unblocked resident ${block.resident.residentId}`);
    }
  } catch (err) {
    console.error("❌ Resident block cleanup failed:", err);
  }
});
//handle file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "public/uploads") //path to store file
    },
    //assign unique name for files
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname))
        // 123456789 omayma.png => 123456789.png
    }
})
const upload =multer({storage: storage})

const addResident = async (req, res) => {
    const residentId = generateResidentId();
    const qrData = residentId;
    const qrImagePath = `public/qrcodes/residents/${residentId}.png`;
    const role = "resident";

    try {
        const {
            name,
            email,
            phone,
            gender,
            maritalStatus,
            residentType,
            apartment,
            password,
        } = req.body;

        // MongoDB Validations
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ success: false, error: "Email already registered" });
        }

        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            return res.status(400).json({ success: false, error: "Phone number already registered" });
        }

        const building = await Building.findOne();
        if (!building) {
            return res.status(500).json({ success: false, error: "Building configuration not found" });
        }

        const currentResidentCount = await Resident.countDocuments({ apartment });
        if (currentResidentCount >= building.residentsPerApartment) {
            return res.status(400).json({ success: false, error: "Maximum number of residents for this apartment reached" });
        }

        // Save to MongoDB
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
           residentId,
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            profileImage: req.file ? req.file.filename : "",
        });
       const savedUser = await newUser.save();
        console.log("✅ User saved with ID:", savedUser._id);

try {
    await QRCode.toFile(qrImagePath, qrData);
    console.log("✅ QR Code saved");
} catch (err) {
    console.error("❌ QR Code generation failed:", err);
}

const newResident = new Resident({
    userId: savedUser._id,
    residentId,
    gender,
    maritalStatus,
    residentType,
    apartment,
    qrCodeData: qrData,
    qrCodeImage: `${residentId}.png`,
});

try {
    await newResident.save();
    console.log("✅ Resident saved");
} catch (err) {
    console.error("❌ Resident save error:", err);
}


        // 🔗 Hyperledger Fabric: also store resident on blockchain
 const args = [
    residentId,  // args[0] in chaincode
    name,        // args[1]
    email,       // args[2]
    phone,       // args[3]
    gender,      // args[4]
    maritalStatus, // args[5]
    residentType,  // args[6]
    apartment     // args[7]
];


        const channelName = "residentschannel";
        const chaincodeName = "residentManagement"; // use your chaincode name
        const fcn = "RegisterResident"; // use the correct function name in your chaincode
        const username = residentId;     // use admin or default user for now
        const orgName = "Org1";       // use org from your setup
      const response = await helper.getRegisteredUser(username, orgName, 'resident',true);
       console.log(" getRegisteredUser Fabric Response:", response);
        try {
            const fabricResponse = await invoke.invokeTransaction(
                channelName,
                chaincodeName,
                fcn,
                args,
                username,
                orgName
            );
           
            console.log("✅ invokeTransaction Fabric Response:", fabricResponse);
        } catch (fabricError) {
            console.error("❌ Failed to add resident to Fabric:", fabricError);
            // Optionally rollback MongoDB or log it for retry
        }

        return res.status(200).json({ success: true, message: "Resident created successfully" });

    } catch (error) {
        console.error("Error adding resident:", error.message);
        return res.status(500).json({ success: false, message: "Server error in adding resident" });
    }
};


const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find()
      .populate('userId', { password: 0 })
      .populate('apartment');

    const now = new Date();

    const residentsWithStatus = await Promise.all(
      residents.map(async (resident) => {
        const blockEntry = await Block.findOne({ resident: resident._id });

        // If block exists and has expired, delete it
        if (blockEntry && blockEntry.toDateTime < now) {
          await blockEntry.deleteOne();
        }

        const stillBlocked = await Block.findOne({ resident: resident._id });

        return {
          ...resident.toObject(),
          status: stillBlocked ? "Blocked" : "Active",
        };
      })
    );

    return res.status(200).json({ success: true, residents: residentsWithStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "get residents server error" });
  }
};


const getResident = async (req,res)=>{
    const {id} = req.params;
    try {
        let resident;
        resident = await Resident.findById({_id: id}).populate('userId', {password: 0}).populate('apartment') //0 do not return password
        if(!resident){
            //check with user Id bcz it's inside resident
            resident = await Resident.findOne({userId: id}).
            populate('userId', {password: 0}).
            populate('apartment') 
        }
        //when we find resident retun based on user id user details
        return res.status(200).json({success: true, resident})
    } catch (error) {
        return res.status(500).json({success: false,error: "get Resident server error"})
    }
}

const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, maritalStatus, residentType, apartment } = req.body;

    const resident = await Resident.findById({ _id: id });
    if (!resident) {
      return res.status(404).json({ success: false, error: "Resident not found" });
    }

    const user = await User.findById({ _id: resident.userId });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // If the apartment is being changed
    if (resident.apartment.toString() !== apartment) {
      const building = await Building.findOne(); // adjust if needed
      if (!building) {
        return res.status(404).json({ success: false, error: "Building not found" });
      }

      const residentCount = await Resident.countDocuments({ apartment });
      if (residentCount >= building.residentsPerApartment) {
        return res.status(400).json({ success: false, error: "Apartment already full" });
      }
    }

    // Update user and resident
    const updateUser = await User.findByIdAndUpdate({ _id: resident.userId }, { name });
    const updateResident = await Resident.findByIdAndUpdate(
      { _id: id },
      { maritalStatus, residentType, apartment }
    );

    if (!updateUser || !updateResident) {
      return res.status(404).json({ success: false, error: "Update failed" });
    }

// 🧩 Chaincode call to update on Fabric
try {
  const channelName = "residentschannel";
  const chaincodeName = "residentManagement";
  const fcn = "UpdateResident";
  const username = resident.residentId;
  const orgName = "Org1";

  // Use updated and existing values correctly
  const args = [
    resident.residentId,               // ID from existing resident
    name,                              // updated name from req.body
    user.email,                        // existing email from DB
    user.phone,                        // existing phone from DB
    resident.gender,                   // existing gender from DB
    maritalStatus,                     // updated maritalStatus
    residentType,                      // updated residentType
    apartment                          // updated apartment
  ];

  const fabricResponse = await invoke.invokeTransaction(
    channelName,
    chaincodeName,
    fcn,
    args,
    username,
    orgName
  );

  console.log("✅ Fabric chaincode response:", fabricResponse);
} catch (fabricError) {
  console.error("❌ Chaincode update error:", fabricError.message);
  return res.status(500).json({ success: false, error: "Fabric chaincode update failed" });
}


  } catch (error) {
    console.error("❌ update Resident error:", error);
    return res.status(500).json({ success: false, error: "Update Resident server error" });
  }
};


const fetchResidentsByAprtId = async (req,res)=>{
    const {id} = req.params; //arpt id
    try {
        const residents = await Resident.find({apartment: id}) 
        return res.status(200).json({success: true, residents})
    } catch (error) {
        return res.status(500).json({success: false,error: "get ResidentByArptID server error"})
    }
}

const deleteResident = async (req,res) =>{
  try {
      const {id} = req.params;
      const residentToDelete = await Resident.findById(id);
      
      if (!residentToDelete) {
          return res.status(404).json({ success: false, error: "Resident not found" });
      }
      
      await residentToDelete.deleteOne();
      return res.status(200).json({
          success: true, 
          message: "Resident deleted successfully",
          deletedResident: residentToDelete
      });
  } catch (error) {
      console.error("Delete resident error:", error);
      return res.status(500).json({
          success: false,
          error: error.message || "Failed to delete resident"
      });
  }
}

const blockResident = async (req, res) => {
  const { id } = req.params;
  const { reason, from, fromTime, to, toTime } = req.body;

  try {
    const resident = await Resident.findById(id);
    if (!resident) {
      return res.status(404).json({ success: false, error: "Resident not found" });
    }

    // First block in MongoDB
    const fromDateTime = new Date(`${from}T${fromTime}`);
    const toDateTime = new Date(`${to}T${toTime}`);

    const existingBlock = await Block.findOne({ resident: id });
    if (existingBlock) {
      return res.status(400).json({ success: false, error: "Resident already blocked." });
    }

    const blockedBy = req.user.id;
    const blockEntry = new Block({
      resident: id,
      reason,
      blockedBy,
      fromDateTime,
      toDateTime
    });

    await blockEntry.save();

    // Then invoke chaincode
    const channelName = "residentschannel";
    const chaincodeName = "residentManagement";
    const fcn = "BlockResident";
    const username = resident.residentId;
    const orgName = "Org1";

    const args = [
      resident.residentId, // args[0]
      reason,              // args[1]
      blockedBy.toString(),// args[2]
      from,                // args[3]
      fromTime,            // args[4]
      to,                  // args[5]
      toTime               // args[6]
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

      console.log("✅ Fabric block response:", fabricResponse);
      return res.status(200).json({ success: true, message: "Resident blocked successfully" });

    } catch (fabricError) {
      // Rollback MongoDB if Fabric fails
      await blockEntry.deleteOne();
      console.error("❌ Fabric block error:", fabricError);
      return res.status(500).json({ 
        success: false, 
        error: "Resident blocked in database but failed on blockchain",
        details: fabricError.message 
      });
    }

  } catch (error) {
    console.error("Error blocking resident:", error.message);
    return res.status(500).json({ success: false, error: "Server error while blocking resident" });
  }
};

const unblockResident = async (req, res) => {
  const { id } = req.params;

  try {
    const resident = await Resident.findById(id);
    if (!resident) {
      return res.status(404).json({ success: false, error: "Resident not found" });
    }

    const blockEntry = await Block.findOne({ resident: id });
    if (!blockEntry) {
      return res.status(404).json({ success: false, error: "Block entry not found" });
    }

    // First unblock in MongoDB
    await blockEntry.deleteOne();

    // Then invoke chaincode
    const channelName = "residentschannel";
    const chaincodeName = "residentManagement";
    const fcn = "UnblockResident";
    const username = resident.residentId;
    const orgName = "Org1";

    const args = [resident.residentId]; // Only needs resident ID

    try {
      const fabricResponse = await invoke.invokeTransaction(
        channelName,
        chaincodeName,
        fcn,
        args,
        username,
        orgName
      );

      console.log("✅ Fabric unblock response:", fabricResponse);
      return res.status(200).json({ success: true, message: "resident unblocked successfully" });

    } catch (fabricError) {
      // Recreate block in MongoDB if Fabric fails
      await new Block(blockEntry).save();
      console.error("❌ Fabric unblock error:", fabricError);
      return res.status(500).json({ 
        success: false, 
        error: "Resident unblocked in database but failed on blockchain",
        details: fabricError.message 
      });
    }

  } catch (error) {
    console.error("Error unblocking resident:", error.message);
    return res.status(500).json({ success: false, error: "Server error while unblocking resident" });
  }
};

export {addResident,upload,getResidents,getResident,
  updateResident,fetchResidentsByAprtId,deleteResident,blockResident, unblockResident}
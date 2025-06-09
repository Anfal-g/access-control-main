import Resident from "../models/Resident.js";
import EntryLog from '../models/EntryLog.js';
import Block from '../models/Block.js';
import Visitor from "../models/Visitor.js";
import VisitRequest from "../models/VisitRequest.js";
import query from '../../../BasicNetwork-2.0-master/api-2.0/app/query.js';
import invoke from '../../../BasicNetwork-2.0-master/api-2.0/app/invoke.js';

const verifyQR = async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    return res.status(400).json({ success: false, error: 'No QR data provided' });
  }

  const prefix = qrData.split('-')[0];

  try {
    if (prefix === 'RES') {
      await verifyResident(qrData, res);  // Pass res to reuse logic
    } else if (prefix === 'VIS') {
      await verifyVisitor(qrData, res);
    } else if (prefix === 'REQ') {
      await verifyRequest(qrData, res);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid QR code format' });
    }
  } catch (error) {
    console.error('QR verification error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying QR code' });
  }
};


const verifyResident = async (qrData, res) => {
  try {
    // Chaincode parameters
    const channelName = 'residentschannel';
    const chaincodeName = 'residentManagement';
    const username = 'admin2';
    const org_name = 'Org2';

    // 1. Get resident from blockchain
    const resident = await query.query(
      channelName, 
      chaincodeName, 
      [qrData], 
      'GetResident', 
      username, 
      org_name
    );

    if (!resident || resident.error) {
      return res.status(404).json({ 
        success: false, 
        error: 'Resident not found on chain' 
      });
    }

    // 2. Check block status
    if (resident.isBlocked) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Resident Blocked',
      });
    }

    // 3. Fetch resident from MongoDB
    const residentMongo = await Resident.findOne({ qrCodeData: qrData })
      .populate('userId', 'name email')
      .populate('apartment', 'apartment_name');

    if (!residentMongo) {
      return res.status(404).json({ 
        success: false, 
        error: 'Resident not found in MongoDB metadata' 
      });
    }

    // // 4. Check if already entered
    const lastLog = await EntryLog.findOne({ resident: residentMongo._id }).sort({ timestamp: -1 });

    // if (lastLog && lastLog.type === 'enter') {
    //   return res.status(400).json({ 
    //     success: false, 
    //     error: 'Resident already marked as entered' 
    //   });
    // }

    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    const nextAction = 'enter';

    // 5. Save log to MongoDB
    const mongoLog = new EntryLog({
      resident: residentMongo._id,
      type: nextAction,
      timestamp: now,
    });
    await mongoLog.save();

    // 6. Save to blockchain
// 6. Save to blockchain
try {
  const blockchainResponse = await invoke.invokeTransaction(
    channelName,
    chaincodeName,
    'SaveLogToChain',
    [qrData, nextAction, timestamp.toString()],
    username,
    org_name
  );
} catch (bcError) {
  console.error('Blockchain invoke failed:', bcError);

  // If you intended to update a status field or something else, do it like this:
  await EntryLog.updateOne(
    { _id: mongoLog._id },
    { $set: { blockchainStatus: 'failed' } } // example field
  );
}


    // 7. Respond to client
    res.status(200).json({
      success: true,
      message: 'Resident entered successfully',
      action: nextAction,
      residentMongo
    });

  } catch (error) {
    console.error('QR verification error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying QR code' });
  }
};

const verifyVisitor = async (qrData, res) => {
  try {


        const visitorMongo = await Visitor.findOne({ qrCodeData: qrData })
      .populate({
        path: 'resident',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'apartment', select: 'apartment_name' }
        ]
      });

    if (!visitorMongo) {
      return res.status(404).json({ success: false, error: 'Visitor not found' });
    }

    const residentId = visitorMongo.residentId;  // From the Mongo document
      // Chaincode parameters
    const channelName = 'residentschannel';
    const chaincodeName = 'residentManagement';
    const username = 'admin2';
    const org_name = 'Org2';

    // 1. Get resident from blockchain
    const visitor = await query.query(
      channelName, 
      chaincodeName, 
      [residentId,qrData], 
      'GetVisitor', 
      username, 
      org_name
    );

    if (!visitor || visitor.error) {
      return res.status(404).json({ 
        success: false, 
        error: 'Visitor not found on chain' 
      });
    }

    // 2. Check block status
    if (visitor.visitor && visitor.visitor.status === "Blocked") {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Visitor Blocked',
      });
    }
   const now = new Date();

    // Convert time strings to today's Date objects
    const todayStr = now.toISOString().split('T')[0]; // e.g. "2025-04-23"
    const from = new Date(`${todayStr}T${visitor.visitTimeFrom}`);
    const to = new Date(`${todayStr}T${visitor.visitTimeTo}`);
    if (now < from || now > to) {
      return res.status(403).json({ success: false, error: 'Visitor access is not allowed at this time' });
    }




    const timestamp = Math.floor(now.getTime() / 1000);
    const nextAction = 'enter';

    // Save log
    const newLog = new EntryLog({
       visitor: visitor._id,
       type: nextAction ,
       timestamp: now,
      });
    await newLog.save();

      // 6. Save to blockchain
    try {
      const blockchainResponse = await invoke.invokeTransaction(
        channelName,
        chaincodeName,
        'SaveLogToChain',
        [qrData, nextAction, timestamp.toString()],
        username,
        org_name
      );


    } catch (bcError) {
      console.error('Blockchain invoke failed:', bcError);
      await EntryLog.updateOne(
        { _id: newLog._id },
     
      );
    }
    return res.status(200).json({
      success: true,
      message: 'Visitor entered successfully',
      action: nextAction,
      role: 'visitor',
      visitor,
    });

  } catch (error) {
    console.error('Error verifying visitor QR code:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying visitor QR code' });
  }
};

const verifyRequest = async (qrData, res) => {
  try {
    const username = 'admin2';
    const orgName = 'Org2';

    // Fetch visit request from blockchain
    const request = await query.query(
      'residentschannel',
      'residentManagement', 
      [qrData],
      'GetVisitRequest',
      username,
      orgName
    );

    if (request.error) {
      return res.status(404).json({ 
        success: false, 
        error: request.error.includes('not found') ? 
          'Visit request not found' : 
          'Error fetching visit request' 
      });
    }

    // Ensure the request is accepted
    if (request.status !== 'accepted' && request.Status !== 'accepted') {
      return res.status(403).json({ 
        success: false, 
        error: 'Visit request is not accepted' 
      });
    }

    // Check visit time window
    const now = new Date();
    const from = new Date(`${request.visitDate || request.VisitDate}T${request.visitTimeFrom || request.VisitTimeFrom}`);
    const to = new Date(`${request.visitDate || request.VisitDate}T${request.visitTimeTo || request.VisitTimeTo}`);

    if (now < from || now > to) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Visit only allowed between ${from.toLocaleString()} and ${to.toLocaleString()}` 
      });
    }

    // Step 1: Find VisitRequest by requestId (string)
    const visitRequest = await VisitRequest.findOne({ requestId: qrData });
    if (!visitRequest) {
      return res.status(404).json({ success: false, error: 'Visit request not found' });
    }

    // Step 2: Check if an 'enter' log already exists
    // const existingEnterLog = await EntryLog.findOne({
    //   visitRequest: visitRequest._id,
    //   type: 'enter'
    // });

    // if (existingEnterLog) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'Visitor has already entered'
    //   });
    // }


    const timestamp = Math.floor(now.getTime() / 1000);
    const nextAction = 'enter';

    // 5. Save log to MongoDB
    const mongoLog = new EntryLog({
      visitRequest: visitRequest._id,
      type: nextAction,
      timestamp: now,
    });
    await mongoLog.save();


       // 6. Save to blockchain
    try {
      const blockchainResponse = await invoke.invokeTransaction(
        'residentschannel',
         'residentManagement', 
        'SaveLogToChain',
        [qrData, nextAction, timestamp.toString()],
        username,
        orgName
      );


    } catch (bcError) {
      console.error('Blockchain invoke failed:', bcError);
    }

    return res.status(200).json({
      success: true,
      message: 'Visitor entered successfully',
      action: 'enter',
      role: 'visitor',
      request
    });

  } catch (error) {
    console.error('Error verifying request QR code:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error verifying request QR code',
      error: error.message 
    });
  }
};


const getEntryLogs = async (req, res) => { 
  try {
    const entryLogs = await EntryLog.find()
      .populate({
        path: 'resident',
        populate: [
          { path: 'apartment' },
          { path: 'userId' }
        ]
      })
      .populate({
        path: 'visitor',
        populate: {
          path: 'resident',
          populate: {
            path: 'apartment'
          }
        }
      })
      .populate({
        path: 'visitRequest', // 👈 Add this to get visit request info
        populate: [
          { path: 'createdBy' },
          { path: 'targetResident', populate: { path: 'apartment' } }
        ]
      });

    return res.status(200).json({ success: true, entryLogs });
  } catch (error) {
    console.error("getEntryLogs error:", error);
    return res.status(500).json({ success: false, error: "get entryLogs server error" });
  }
};

  
  export {verifyQR,getEntryLogs}
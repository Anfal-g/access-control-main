import Resident from '../models/Resident.js';
import VisitRequest from '../models/VisitRequest.js';
import User from '../models/User.js';
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
import { generateRequestId } from '../utils/generateRequestId.js';
import Notification from '../models/Notification.js';
import invoke from '../../../BasicNetwork-2.0-master/api-2.0/app/invoke.js';

export const getResidentsByApartmentId = async (req, res) => {
  try {
      const { id } = req.params;
      
      const residents = await Resident.find({ apartment: id })
        .populate('userId', 'name email phone')
        .exec();

      if (residents.length === 0) {
        console.log('❌ No residents found for this apartment');
        return res.status(404).json({ success: false, error: "No residents found for this apartment" });
      }

      // console.log('✅ Residents:', residents);
      return res.status(200).json({success: true, residents})
  } catch (error) {
     console.error('❌ Error:', error);
     return res.status(500).json({success: false,error: "getResidentsByApartmentId server error"})
  } 
}

export const addVisitRequest = async (req, res) => {
  try {
    const {
      targetResident,
      visitorName,
      visitorPhone,
      type,
      visitPurpose,
      customReason,
      visitTimeFrom,
      visitTimeTo,
      visitDate,
    } = req.body;

    const createdBy = req.user.id;

    // Generate request ID FIRST (matches chaincode format)
   // const requestId = `REQ_${Date.now()}`;
  const requestId = generateRequestId(); // Unique ID
    // 1. Save to MongoDB with the generated requestId
    const newRequest = new VisitRequest({
      requestId, // Store the same ID that will be used in blockchain
      createdBy,
      targetResident,
      visitorName,
      visitorPhone,
      type,
      visitPurpose,
      customReason,
      visitTimeFrom,
      visitTimeTo,
      visitDate,
    });

    await newRequest.save();

    // 2. Get resident info for chaincode
    const resident = await Resident.findById(targetResident);
    if (!resident) {
      // Compensating transaction if resident not found
      await VisitRequest.deleteOne({ _id: newRequest._id });
      return res.status(404).json({ success: false, message: 'Target resident not found.' });
    }

    // 3. Invoke chaincode with the SAME requestId
    const channelName = "residentschannel";
    const chaincodeName = "residentManagement";
    const fcn = "AddVisitRequest";
    const username = resident.residentId;
    const orgName = "Org1";

    const args = [
      requestId,       // args[0] - Pass as first argument
      createdBy,       // args[1] - CreatedBy (user ID)
      resident.residentId, // args[2] - TargetResident
      visitorName,     // args[3] - VisitorName
      visitorPhone,    // args[4] - VisitorPhone
      type,            // args[5] - Type
      visitPurpose,    // args[6] - VisitPurpose
      customReason,    // args[7] - CustomReason
      visitTimeFrom,   // args[8] - VisitTimeFrom
      visitTimeTo,     // args[9] - VisitTimeTo
      visitDate        // args[10] - VisitDate
    ];

    const fabricResponse = await invoke.invokeTransaction(
      channelName,
      chaincodeName,
      fcn,
      args,
      username,
      orgName
    );

    // 4. Create notification
    await new Notification({
      user: resident.userId,
      visitRequest: newRequest._id,
    }).save();

    return res.status(201).json({ 
      success: true, 
      message: "Visit request created in both systems and notification sent.",
      request: {
        mongoId: newRequest._id,
        requestId: requestId // Return the shared ID
      }
    });

  } catch (error) {
    console.error("Error creating visit request:", error);
    
    // Compensating transaction on error
    if (newRequest?._id) {
      await VisitRequest.deleteOne({ _id: newRequest._id });
    }

    return res.status(500).json({ 
      success: false, 
      error: "Failed to create visit request",
      details: error.message 
    });
  }
};

export const getRequestsByresidentId = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get the resident document linked to the current user
    const resident = await Resident.findOne({ userId });

    if (!resident) {
      return res.status(404).json({ success: false, message: "Resident not found" });
    }

    // Step 2: Find visit requests where this resident is the target
    const requests = await VisitRequest.find({ targetResident: resident._id })
      .populate('createdBy', 'name email') // populate admin details if needed
      .populate('targetResident'); // optional

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error("Error fetching visit requests for resident:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch visit requests"
    });
  }
};


export const handleStatusChange = async (req, res) => {
  console.log('\n=== STARTING STATUS CHANGE PROCESS ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);

  const { status } = req.body;
  const allowedStatuses = ['accepted', 'rejected'];
  const adminId = req.user.id;

  if (!allowedStatuses.includes(status)) {
    console.log('❌ Invalid status value received:', status);
    return res.status(400).json({ success: false, error: 'Invalid status value.' });
  }

  try {
    console.log('\n[1/7] Fetching request from MongoDB...');
    const request = await VisitRequest.findById(req.params.id);
    if (!request) {
      console.log('❌ Request not found in MongoDB');
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (!request.requestId) {
      console.log('❌ Request missing requestId');
      return res.status(400).json({ 
        success: false, 
        error: 'Request missing blockchain reference' 
      });
    }

    console.log('✅ Request found:', { 
      id: request._id, 
      status: request.status,
      requestId: request.requestId 
    });

    console.log('\n[2/7] Preparing updates...');
    const updateData = { status };
    const requestId = request.requestId;

    if (status === 'accepted') {
      const qrImagePath = `public/qrcodes/requests/${requestId}.png`;
      console.log('Generating QR code at:', qrImagePath);
      await QRCode.toFile(qrImagePath, requestId);
      updateData.qrData = requestId;
      updateData.qrImage = `${requestId}.png`;
    }

    console.log('\n[3/7] Fetching resident info...');
    const resident = await Resident.findById(request.targetResident);
    if (!resident) {
      console.log('❌ Resident not found');
      return res.status(404).json({ success: false, error: 'Resident not found' });
    }

    console.log('\n[4/7] Preparing chaincode invocation...');
    const args = [requestId, status, adminId];

    console.log('\n[5/7] Invoking blockchain update...');
    try {
      const fabricResponse = await invoke.invokeTransaction(
        "residentschannel",
        "residentManagement",
        "UpdateVisitRequestStatus",
        args,
        resident.residentId,
        "Org1"
      );
      
      // Handle potential non-JSON response
      let responseString;
      try {
        responseString = fabricResponse.toString();
        JSON.parse(responseString); // Test if it's valid JSON
        console.log('✅ Blockchain update successful:', responseString);
      } catch (e) {
        console.log('ℹ️ Blockchain returned non-JSON response:', responseString);
      }
    } catch (fabricError) {
      console.error('❌ Blockchain update failed:', fabricError);
      throw new Error(`Blockchain update failed: ${fabricError.message}`);
    }

    console.log('\n[6/7] Updating MongoDB...');
    const updatedRequest = await VisitRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    console.log('✅ MongoDB status updated to:', updatedRequest.status);

    if (status === 'accepted') {
      console.log('\n[7/7] Creating notification...');
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        await new Notification({
          user: adminUser._id,
          visitRequest: updatedRequest._id,
        }).save();
      }
    }

    console.log('\n=== STATUS CHANGE COMPLETED ===');
    return res.json({ 
      success: true, 
      message: `Request ${status} in both systems.`, 
      request: updatedRequest 
    });

  } catch (error) {
    console.error('\n=== STATUS CHANGE FAILED ===', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message.includes('Blockchain') 
        ? 'Status updated in blockchain but failed to complete other steps' 
        : 'Failed to update status',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
export const getRequests = async (req, res) => {
  try {
    const requests = await VisitRequest.find()

    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error("Error fetching all visit requests:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch all visit requests"
    });
  }
};
export const getRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await VisitRequest.findById(requestId)

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    return res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error("Error in getRequest:", error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};


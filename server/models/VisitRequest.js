import mongoose from 'mongoose';

const { Schema } = mongoose

const VisitRequestSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetResident: { type: Schema.Types.ObjectId, ref: "Resident", required: true },
    visitorName: { type: String, required: true },
    visitorPhone: { type: String },
    type: { type: String, enum: ['single', 'group'], required: true },
    visitPurpose: { type: String, enum: ['delivery', 'maintenance', 'personal', 'service', 'others'], required: true },
    customReason: { type: String },
    visitTimeFrom: { type: String, required: true },
    visitTimeTo: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestId: { type: String }, // New
    qrData: { type: String }, // New
    qrImage: { type: String }, // New (path to image)
    visitDate: { type: String, required: true } ,// Format: 'YYYY-MM-DD'
    createdAt: { type: Date, default: Date.now }
});  
  
const VisitRequest = mongoose.model("VisitRequest", VisitRequestSchema);
export default VisitRequest;
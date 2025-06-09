import mongoose from 'mongoose';

const requestedVisitorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String },
  visitReason: { type: String },
  targetResident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident" },
  visitType: {
    type: String,
    enum: ["delivery", "service", "meet-resident", "meet-admin", "other"],
    required: true
  },
  status: { type: String, enum: ["pending", "approved", "denied"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const RequestedVisitor = mongoose.model("RequestedVisitor", requestedVisitorSchema);
export default RequestedVisitor;

import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs'

const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true }, // auto-generated
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident", required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  visitTimeFrom: { type: String, required: true }, 
  visitTimeTo: { type: String, required: true },   
  relationship: { type: String }, // e.g. "Friend", "cousin"
  qrCodeData: { type: String },
  qrCodeImage: { type: String },
  residentId: {
  type: String,
  required: true,
},
  createdAt: { type: Date, default: Date.now }
});

visitorSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    const residentId = this._id;

    // 1. Delete QR code image
    if (this.qrCodeImage) {
      const qrPath = path.join("public/qrcodes/visitors", this.qrCodeImage);
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Visitor = mongoose.model("Visitor", visitorSchema);
export default Visitor;

import mongoose from 'mongoose'
import User from './User.js';
import fs from 'fs'
import path from 'path'
import Contact from './Contact.js'
import EntryLog from './EntryLog.js'
import Notification from './Notification.js'
import Block from './Block.js'
import Visitor from './Visitor.js'


const { Schema } = mongoose

const residentschema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  residentId: { type: String, required: true, unique: true },
  gender: { type: String },
  maritalStatus: { type: String },
  residentType: { type: String, enum: ["owner", "family"], required: true },
  apartment: { type: Schema.Types.ObjectId, ref: "Apartment", required: true },
  qrCodeData: { type: String },  // 👈 e.g. residentId or JSON
  qrCodeImage: { type: String }, // 👈 base64 image
  visitors: [{ type: Schema.Types.ObjectId, ref: "Visitor" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

residentschema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    const residentId = this._id;

    // 1. Delete all visitors (QR codes + entry logs + visitor docs)
    const visitors = await Visitor.find({ resident: residentId });
    for (const visitor of visitors) {
      // Delete visitor QR code image
      if (visitor.qrCodeImage) {
        const visitorQrPath = path.join("public/qrcodes/visitors", visitor.qrCodeImage);
        if (fs.existsSync(visitorQrPath)) fs.unlinkSync(visitorQrPath);
      }

      // Delete entry logs related to this visitor
      await EntryLog.deleteMany({ visitor: visitor._id });

      // Delete visitor document
      await Visitor.deleteOne({ _id: visitor._id });
    }

    // 2. Delete resident QR code image
    if (this.qrCodeImage) {
      const qrPath = path.join("public/qrcodes/residents", this.qrCodeImage);
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }

    // 3. Delete resident's entry logs
    await EntryLog.deleteMany({ resident: residentId });

    // 4. Delete contacts
    await Contact.deleteMany({ resident: residentId });

    // 5. Delete block
    await Block.deleteOne({ resident: residentId });

    // 6. Delete associated user + profile image + notifications
    const user = await User.findById(this.userId);
    if (user) {
      if (user.profileImage) {
        const profilePath = path.join("public/uploads", user.profileImage);
        if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
      }

      await Notification.deleteMany({ user: user._id });
      await User.deleteOne({ _id: user._id });
    }

    next();
  } catch (error) {
    next(error);
  }
});



const Resident = mongoose.model("Resident", residentschema)
export default Resident
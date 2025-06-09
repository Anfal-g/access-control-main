import mongoose from "mongoose";
import Resident from "./Resident.js";
import User from "./User.js";
import Contact from "./Contact.js";
import fs from 'fs';
import path from 'path';
import EntryLog from './EntryLog.js';
import Block from './Block.js';
import Notification from './Notification.js';
import Visitor from './Visitor.js';


  const apartmentSchema = new mongoose.Schema({
    apartment_name:{type: String, require: true},
    description: {type: String},
    creatAt: {type: Date, default: Date.now},
    updateAt: {type: Date, default: Date.now}
  })

  //we will create midleware (pre) to delete Residents , Contact , salaries then we will delete the apartmentys !!!
// 🧹 DELETE HOOK
apartmentSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    const apartmentId = this._id;

    // 1. Get all residents of this apartment
    const residents = await Resident.find({ apartment: apartmentId });
    const resIds = residents.map(res => res._id);
    const userIds = residents.map(res => res.userId);

    for (const res of residents) {
      // Delete resident QR code image
      if (res.qrCodeImage) {
        const qrPath = path.join("public/qrcodes/residents", res.qrCodeImage);
        if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
      }

      // 2. Delete Visitors (QR + entry logs)
      const visitors = await Visitor.find({ resident: res._id });
      for (const visitor of visitors) {
        if (visitor.qrCodeImage) {
          const visitorQRPath = path.join("public/qrcodes/visitors", visitor.qrCodeImage);
          if (fs.existsSync(visitorQRPath)) fs.unlinkSync(visitorQRPath);
        }

        // Delete entry logs of this visitor
        await EntryLog.deleteMany({ visitor: visitor._id });
      }

      await Visitor.deleteMany({ resident: res._id });

      // 3. Delete entry logs of this resident
      await EntryLog.deleteMany({ resident: res._id });

      // 4. Delete notifications (must be before contacts)
      const contacts = await Contact.find({ resident: res._id });
      const contactIds = contacts.map(c => c._id);
      await Notification.deleteMany({ contact: { $in: contactIds } });

      // 5. Delete contacts
      await Contact.deleteMany({ resident: res._id });

      // 6. Delete blocks
      await Block.deleteMany({ resident: res._id });
    }

    // 7. Delete residents
    await Resident.deleteMany({ apartment: apartmentId });

    // 8. Delete users and their profile images
    const users = await User.find({ _id: { $in: userIds } });
    for (const user of users) {
      if (user.profileImage) {
        const profilePath = path.join("public/uploads", user.profileImage);
        if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
      }
    }
    await User.deleteMany({ _id: { $in: userIds } });

    next();
  } catch (error) {
    next(error);
  }
});


  //deleteOne it's a methode
  //raw obj false  we can not acces the raw objct

  const Apartment =mongoose.model("Apartment",apartmentSchema)
  export default Apartment;
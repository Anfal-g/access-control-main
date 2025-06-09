import mongoose from "mongoose";
const { Schema } = mongoose;

const contactSchema = new Schema({
  resident: {type: Schema.Types.ObjectId,ref: "Resident",required: true,},
  subject: {type: String,required: true,},
  message: { type: String,required: true,},
  sentAt: {type: Date,default: Date.now, },
  isResolved: {type: Boolean,default: false,},
  reply: {
    message: { type: String },
    sentAt: { type: Date },
  },
});

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;

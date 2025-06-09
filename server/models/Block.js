import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: "Resident",  unique: true },
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor",  unique: true },
  reason: { type: String },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fromDateTime: { type: Date, required: true },
  toDateTime: { type: Date, required: true },
  blockedAt: { type: Date, default: Date.now}
});

const Block = mongoose.model("Block", blockSchema);
export default Block;

import mongoose from 'mongoose';

const entryLogSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  visitRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'VisitRequest' },
  type: { type: String, enum: ['enter', 'leave'], required: true },
  timestamp: { type: Date, default: Date.now },
  // blockchainTxId: { 
  //   type: String,
  //   enum: ['pending', 'failed', 'completed'],
  //   default: 'pending'
  // },
  // blockchainDetails: {
  //   txTimestamp: Date,       // When the transaction was confirmed
  //   blockNumber: Number,     // Block number where it was recorded
  //   chaincodeVersion: String // Version of chaincode that processed it
  // }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// // Add index for faster querying of blockchain status
// entryLogSchema.index({ blockchainTxId: 1 });
// entryLogSchema.index({ resident: 1, blockchainTxId: 1 });

const EntryLog = mongoose.model('EntryLog', entryLogSchema);
export default EntryLog;
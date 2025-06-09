import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  contact: { type: Schema.Types.ObjectId, ref: 'Contact'}, 
  visitRequest: { type: Schema.Types.ObjectId, ref: 'VisitRequest'}, 
  isRead: { type: Boolean, default: false }, // Read status
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

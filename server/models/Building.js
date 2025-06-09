import mongoose from "mongoose";
const { Schema } = mongoose;

const buildingSchema = new Schema({
  name: { type: String, required: true },
  numberOfApartments: { type: Number, required: true },
  residentsPerApartment: { type: Number, required: true },
  maxVisitorsPerResident: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Building = mongoose.model("Building", buildingSchema);
export default Building;

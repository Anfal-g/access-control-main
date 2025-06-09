import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    console.log("Mongo URL:", process.env.MONGODB_URL);  // Debug line
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectToDatabase;

import mongoose from "mongoose";
// define all the properties that user has
const userSchema = new mongoose.Schema({
    residentId: { type: String, required: true, unique: true },
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone: { type: String , unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["admin","resident"], required: true},
    profileImage: {type: String},
    createAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
})

// create a model and export it 
const User = mongoose.model("User",userSchema) // define name of our mpdel "User"
export default User;

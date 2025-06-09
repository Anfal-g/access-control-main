import User from "./models/User.js"
import bcrypt from "bcryptjs"
import connectToDatabase from "./db/db.js"
// At the top of userSeed.js
import dotenv from "dotenv";
dotenv.config(); // <- must be called before using process.env

const userRegister = async ()=> {
    connectToDatabase()
    try {
        //hash the password (password ,salt for generating unique caracters)
        const hashPassword = await bcrypt.hash("admin",10)
        const newUser = new User({
            name: "Admin2",
            email: "admin2@gmail.com",
            password: hashPassword,
            role: "admin",
            phone: "123456789",
            profileImage: "https://example.com/image.jpg",
             residentId: "ADMIN-0001" // <-- Add a value
        })
        await newUser.save()
    } catch (error) {
        console.log(error)
    }
}

//call the function
userRegister();
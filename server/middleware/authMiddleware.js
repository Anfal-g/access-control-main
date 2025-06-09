//inside this we will verify the user
import jwt from "jsonwebtoken"
import User from "../models/User.js";
const verifyUser = async (req,res,next) =>{
    try {
        //we will check the token stored in local storage
        //means just read token from authorization we will split (bearer $token)and read the first elament "token"
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(404).json({success: false , error:"Token Not provided"})
        }
        // if it's available we will check it is it ok or not by jwt
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        if(!decoded){
            return res.status(404).json({success: false , error:"Token Not Valid"})
        }
        //if it's valid we will read the user
        const user= await User.findById({_id: decoded._id}).select('-password') //without the password select all the
        if(!user){
            return res.status(404).json({success: false , error:"User Not found"})
        }
        //if it's ok 
        req.user= user
        //console.log("Middleware authMiddleware exécuté");
        next() // continue the operation !!
    } catch (error) {
        return res.status(500).json({success: false , error:"Server error"})
    }
}

export default verifyUser;
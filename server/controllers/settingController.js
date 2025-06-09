import User from "../models/User.js"
import bcrypt from "bcryptjs";

const changePassword= async(req,res)=>{
    try {
        const {userId, oldPassword,newPassword,confirmPassword}=req.body;

        //check user
        const user= await User.findById({_id: userId})
        // console.log("user",user)
        if(!user){
            return res.status(404).json({success: false , error:"user not found" })  
        }
        //user availabale check the old password
        const isMAtch = await bcrypt.compare(oldPassword, user.password)
        // console.log("isMAtch",isMAtch)
        if(!isMAtch){
            return res.status(404).json({success: false , error:"wrong old pasword" })  
        }
        //if password ok hash tha pass
        const hashPassword = await bcrypt.hash(newPassword,10)

        const newUser = await User.findByIdAndUpdate({_id: userId}, {password: hashPassword})
        // console.log("newUser",newUser)
        return res.status(200).json({success: true})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false ,message:"setting error"})
    }
}
export{changePassword}
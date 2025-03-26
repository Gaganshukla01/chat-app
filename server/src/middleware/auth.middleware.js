import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protectedAuth=async(req,res,next)=>{
    try {
        
        const token=req.cookies.jwt

        if(!token){
            return res.status("401").json({message:"Unauthorised no token found"})
        }

        const decode=jwt.verify(token,process.env.JWT_SECRET)

        if(!decode){
            return res.status("401").json({message:"Unauthorised!! Invalid token "})
        }

        const user=await User.findById(decode.userId).select("-password");

        if(!user){
            return res.status("401").json({message:"User not found"})
        }

        req.user=user
        next()
        
    } catch (error) {
        
        return res.status("400").json({message:"Error occured"})
    }
}
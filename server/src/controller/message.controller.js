import User from "../models/user.model.js"
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudniary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";



export const getAllUsers=async(req,res)=>{
    try {
        const loggedInUser=req.user._id
        const filteredUsers=await User.find({ _id:{ $ne : loggedInUser}}).select("-password");
        return res.status(200).json(filteredUsers)
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
}


export const getMessage=async(req,res)=>{
    try {
        const{id:userToChat}=req.params
        const senderId=req.user._id

       const message=await Message.find({
        $or:[
            { senderId:senderId, receiverId:userToChat },
            { senderId:userToChat, receiverId:senderId }
        ]
       })
       
        return res.status(200).json(message)
      
 
    } catch (error) {
        return res.status(400).json({message:"Error occured"})
    }
}

export const sendMessage= async (req,res)=>{
    try {
        const {text,image}=req.body
        const {id:receiverId}=req.params
        
        const senderId = req.user._id;

        // for cloudniary
        // let imgUrl
        // if(image){
        //     const imageResponse= await cloudinary.uploader.upload(image)
        //     imgUrl=imageResponse.secureUrl
            
        // }

        const newMessage= new Message({
              senderId,
              receiverId,
              text,
              image
        })

        await newMessage.save()

        // realtime socket fun to handle 
        const receiverSocketId=getReceiverSocketId(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.status(201).json(newMessage);
    } catch (error) {
        return res.status(400).json({message:error.message})
    }
}
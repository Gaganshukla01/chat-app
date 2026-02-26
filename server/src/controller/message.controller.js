import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudniary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUser } }).select(
      "-password",
    );

    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUser, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUser },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          lastMessageAt: lastMessage?.createdAt || new Date(0),
        };
      }),
    );

    usersWithLastMessage.sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );

    return res.status(200).json(usersWithLastMessage);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
export const getMessage = async (req, res) => {
  try {
    const { id: userToChat } = req.params;
    const senderId = req.user._id;

    const message = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChat },
        { senderId: userToChat, receiverId: senderId },
      ],
    });

    return res.status(200).json(message);
  } catch (error) {
    return res.status(400).json({ message: "Error occured" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id;

    // for cloudniary
    // let imgUrl
    // if(image){
    //     const imageResponse= await cloudinary.uploader.upload(image)
    //     imgUrl=imageResponse.secureUrl

    // }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image,
    });

    await newMessage.save();

    // realtime socket fun to handle
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });

    await Message.findByIdAndDelete(id);

    // notify receiver via socket
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", id);
    }

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You can only edit your own messages" });

    message.text = text;
    message.isEdited = true;
    await message.save();

    // notify receiver via socket
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", message);
    }

    res.status(200).json(message);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

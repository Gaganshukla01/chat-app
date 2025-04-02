import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { genrateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudniary.js";


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Every Field should be required..." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must br 6 Digit" });
    }
    const user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: true, message: "Email already exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      genrateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
  
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user Data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter all field" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const isPasswordCheck = await bcrypt.compare(password, user.password);

    if (!isPasswordCheck) {
      return res.status(400).json({ message: "Password is incorrect" });
    }
    genrateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "User Logout" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // cloudinary
    // const uploadResponse = await cloudinary.uploader.upload(profilePic);
    // console.log(uploadResponse)
    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   { profilePic: uploadResponse.secure_url },
    //   { new: true }
    // );


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic:profilePic},
      { new: true }
    );


    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const isAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(400).json({ message: message.error });
  }
};

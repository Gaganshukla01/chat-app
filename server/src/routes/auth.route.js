import express from "express"
import { login, logout, signup, updateProfile } from "../controller/auth.controller.js"
import { protectedAuth } from "../middleware/auth.middleware.js"

const router=express.Router()


router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)

router.put("/updateProfile",protectedAuth,updateProfile)

export default router;

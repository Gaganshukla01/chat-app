import express from "express"
import { protectedAuth } from "../middleware/auth.middleware.js"
import {getAllUsers,getMessage,sendMessage} from "../controller/message.controller.js"

const router=express.Router()

router.get("/users",protectedAuth,getAllUsers)
router.get("/:id",protectedAuth,getMessage)

router.post("/send/:id",protectedAuth,sendMessage)


export default router
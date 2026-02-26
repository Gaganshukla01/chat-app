import express from "express";
import { protectedAuth } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  getMessage,
  sendMessage,
  deleteMessage,
  updateMessage,
} from "../controller/message.controller.js";

const router = express.Router();

router.get("/users", protectedAuth, getAllUsers);
router.get("/:id", protectedAuth, getMessage);

router.post("/send/:id", protectedAuth, sendMessage);
router.delete("/:id", protectedAuth, deleteMessage);
router.put("/:id", protectedAuth, updateMessage);

export default router;

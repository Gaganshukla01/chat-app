import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTED_URL || ["http://localhost:5173"]
  }
})

// For local environment
const userSocketMap = {}

// Only run socket.io logic when not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
  io.on("connection", (socket) => {
    console.log("A user is connected", socket.id)

    const userId = socket.handshake.query.userId
    if (userId) userSocketMap[userId] = socket.id

    io.emit("getOnlineUser", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user is disconnected", socket.id)

      delete userSocketMap[userId];
      io.emit("getOnlineUser", Object.keys(userSocketMap))
    })
  })
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId]
}

export { io, app, server }
export default app // This is what Vercel will use
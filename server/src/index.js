import express from "express"
import dotenv from "dotenv"
import connectDb from "./lib/db.js"
import cookieParser from "cookie-parser"
import apiRoutes from "./routes/auth.route.js"

dotenv.config()
const app=express()
const PORT=process.env.PORT||4000

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",apiRoutes)

connectDb()
app.listen(PORT,(req,res)=>{
    console.log("Server is Running on: ")
    console.log(`http://localhost:${PORT}`)
})
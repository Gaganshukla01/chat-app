import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDb from "./lib/db.js"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import apiRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"


dotenv.config()
const app=express()
const PORT=process.env.PORT||4000
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",apiRoutes)
app.use("/api/message",messageRoutes)

connectDb()
app.listen(PORT,(req,res)=>{
    console.log("Server is Running on: ")
    console.log(`http://localhost:${PORT}`)
})
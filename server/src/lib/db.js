import mongoose from "mongoose"

const connectDb= async()=>{
    try {
        const URL=process.env.MONGODB_URL
        mongoose.connection.on('connected',()=>console.log("Database is connected"))
        await mongoose.connect(`${URL}/chatApp`)
        
    } catch (error) {
        console.log(error)
    }
}

export default connectDb;
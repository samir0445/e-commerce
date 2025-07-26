import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async ()=>{
    try {
        mongoose.connection.on("connected" , ()=>{
            console.log("database connected ");
            
        })
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
        
    } catch (error) {
        console.log(error);
        
        
    }
}

export default connectDB;
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//connect to mongodb 
const connectDB = async () => {
  try{
    const connectionInstance = await mongoose.connect(process.env.MONGO_URL,{dbName:DB_NAME});

    console.log(`MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}, DB NAME: ${DB_NAME}`);

  }catch(error){
    console.log("MongoDB Connection FAILED:", error);
    process.exit(1);
  }
}
export default connectDB; 
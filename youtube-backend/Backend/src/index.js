// req ('dotenv').config({path: './.env'}); //old way of importing dotenv

//2nd method of connect DB
//port se connect kar rahe h
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

//connectDB() call hota hai. Ye ek Promise(then/catch) return karta hai.
connectDB()
  .then(() => {
    //express app me koe error aayega to
    app.on("error", (error) => {
      console.log("ERROR in Express App: ", error);
      throw error;
    });
    app.listen(PORT, () => {
      console.log(`Server is running at port : http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mango DB localHost connection failed !!! ", err);
  });

//1st method of connect DB
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
/*
import express from "express";
const app = express();
;( async ()=>{
  try{
    await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
    app.on("error", (error) => {
      console.log("ERROR: ", error);
      throw error
    })
    app.listen(process.env.PORT,() => {
      console.log(`Server started at PORT ${process.env.PORT}`);
    })
  }catch(error){
    console.log("Error:", error);
    throw error
  }
})()
*/

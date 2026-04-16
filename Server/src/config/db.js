import mongoose from "mongoose";
import config from "./config.js";

const connectDb=()=>{
  mongoose.connect(config.MONGO_URI);
  console.log("Database connected sucessfully");
}

export default connectDb;
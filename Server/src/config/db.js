import mongoose from "mongoose";
import config from "./config.js";

const connectDb = () => {
  try {
    mongoose.connect(config.MONGO_URI);
    console.log("Database connected sucessfully");
  } catch (err) {
    console.log("Database not connected successfully");
  }
}

export default connectDb;
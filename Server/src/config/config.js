import { configDotenv } from "dotenv";

configDotenv();

if(!process.env.MONGO_URI){
  throw new Error("MONGO_URI variable is not defined")
}

if(!process.env.JWT_ACCESS_SECRET){
  throw new Error("JWT_ACCESS_SECRET variable is not defined")
}

if(!process.env.JWT_REFRESH_SECRET){
  throw new Error("JWT_REFRESH_SECRET variable is not defined")
}

if(!process.env.CLOUDINARY_CLOUD_NAME){
  throw new Error("CLOUDINARY_CLOUD_NAME variable is not defined")
}

if(!process.env.CLOUDINARY_API_KEY){
  throw new Error("CLOUDINARY_API_KEY variable is not defined")
}

if(!process.env.CLOUDINARY_API_SECRET){
  throw new Error("CLOUDINARY_API_SECRET variable is not defined")
}

if(!process.env.RAZORPAY_KEY_ID){
  throw new Error("RAZORPAY_KEY_ID variable is not defined")
}

if(!process.env.RAZORPAY_KEY_SECRET){
  throw new Error("RAZORPAY_KEY_SECRET variable is not defined")
}

if(!process.env.RESEND_API_KEY){
  throw new Error("RESEND_API_KEY variable is not defined")
}

const config={
  PORT:process.env.PORT,
  MONGO_URI:process.env.MONGO_URI,
  JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
  CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
  RESEND_API_KEY:process.env.RESEND_API_KEY,
}

export default config;
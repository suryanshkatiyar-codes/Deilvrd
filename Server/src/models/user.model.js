import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    default: "User",
    enum: ["Admin", "User", "Freelancer"],
  },
  refreshToken: {
    type: String,
    default: null,
    select: false,
  },
  kyc: {
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "submitted", "verified"],
    },
  }
}, { timestamps: true })

const userModel = mongoose.model("Users", userSchema);

export default userModel;
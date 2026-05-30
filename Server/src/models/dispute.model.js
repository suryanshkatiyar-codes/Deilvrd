import mongoose from "mongoose"

const disputeSchema = new mongoose.Schema({
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Milestones",
    required:true,
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contracts",
    required:true,
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required:true,
  },
  status: {
    type: String,
    default: "open",
    enum: ["open", "underReview", "resolved"]
  },
  resolution: {
    type: String,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  releasePercentage:{
    type:Number,
    min:0,
    max:100,
  }
},{timestamps:true})

const disputeModel=mongoose.model("Disputes",disputeSchema);

export default disputeModel;
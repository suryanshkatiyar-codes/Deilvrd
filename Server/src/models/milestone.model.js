import mongoose from "mongoose";

const milestoneSchema=mongoose.Schema({
  client:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users",
    required:true,
  },
  freelancer:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users",
    required:true,
  },
  contract:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Contracts",
    required:true,
  },
  title:{
    type:String,
    required:true,
  },
  description:{
    type:String,
    required:true,
  },
  amount:{
    type:Number,
    required:true,
  },
  dueDate:{
    type:Date,
    required:true,
  },
  status:{
    type:String,
    default:"pending",
    enum:["pending","funded","submitted","approved","disputed","released"],
  },
  deliverableUrl:{
    type:String,
  },
  submittedAt:{
    type:Date,
  }
},{timestamps:true})

const milestoneModel=mongoose.model("Milestones",milestoneSchema);

export default milestoneModel;
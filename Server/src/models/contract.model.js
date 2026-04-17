import mongoose from "mongoose";

const contractSchema=new mongoose.Schema({
  client:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users"
  },
  freelancer:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Users"
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
  status:{
    type:String,
    default:"draft",
    enum:["draft","active","completed","cancelled"],
  }
},{timestamps:true})

const contractModel=mongoose.model("Contracts",contractSchema);

export default contractModel;
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contracts",
    required: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  role: {
    type: String,
    enum: ["clientReviewingFreelancer", "freelancerReviewingClient"],
    required:true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required:true,
  },
  comment: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    required: true,
  }
})

reviewSchema.index({ contract: 1, reviewer: 1 }, { unique: true });

const reviewModel = mongoose.model("Reviews", reviewSchema);
export default reviewModel;

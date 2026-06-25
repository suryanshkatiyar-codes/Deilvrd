import contractModel from "../models/contract.model.js";
import reviewModel from "../models/review.model.js";
import milestoneModel from "../models/milestone.model.js";
import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function submitReview(req, res) {
  try {
    const { contractId } = req.params;
    const { rating, comment } = req.body;

    const contract = await contractModel.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "No such contract exists" });
    }

    // check all milestones are released
    const milestones = await milestoneModel.find({ contract: contractId });
    const allReleased = milestones.every((m) => m.status === "released");
    if (!allReleased) {
      return res.status(403).json({ message: "Reviews only unlock when all milestones are released" });
    }

    // check duplicate review
    const alreadyReviewed = await reviewModel.findOne({
      contract: contractId,
      reviewer: req.user.id,
    });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this contract" });
    }

    // figure out role and reviewee
    const isClient = contract.client.toString() === req.user._id.toString();
    const role = isClient ? "clientReviewingFreelancer" : "freelancerReviewingClient";
    const revieweeId = isClient ? contract.freelancer : contract.client;

    const review = await reviewModel.create({
      contract: contractId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      role,
      rating,
      comment,
      isVerified: true,
    });

    // fetch reviewee details to send email
    const revieweeUser = await userModel.findById(revieweeId).select("username email");

    await sendEmail(
      revieweeUser.email,
      "You Have Received a New Review",
      `<p>Hi ${reviewee.name}, you have received a ${rating}/5 star review. Log in to Delivrd to see what was said.</p>`
    );

    return res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    console.error("submitReview error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function getUserReviews(req, res) {
  try {
    const { userId } = req.params;

    const reviews = await reviewModel
      .find({ reviewee: userId })
      .populate("reviewer", "name email");

    // calculate average rating using aggregation
    const stats = await reviewModel.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);

    const averageRating = stats[0]?.averageRating?.toFixed(1) || 0;

    return res.status(200).json({
      message: "Reviews obtained successfully",
      averageRating,
      reviews,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}
import disputeModel from "../models/dispute.model.js";
import milestoneModel from "../models/milestone.model.js";
import userModel from "../models/user.model.js";
import contractModel from "../models/contract.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function raiseDispute(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }

    const userId = req.user.id;
    const dispute = await disputeModel.create({
      milestone: milestoneId,
      contract: milestone.contract,
      raisedBy: userId,
      status: "open",
    });

    console.log("dispute created:", dispute);
    return res.status(200).json({ message: "Dispute created successfully", dispute });
  } catch (err) {
    console.error("raiseDispute error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function viewDispute(req, res) {
  try {
    const { disputeId } = req.params;
    const dispute = await disputeModel.findById(disputeId).populate("milestone").populate("contract").populate("raisedBy", "name email");
    if (!dispute) {
      return res.status(400).json({ message: "Dispute does not exist" });
    }
    return res.status(200).json({ message: "Dispute obtained successfully", dispute });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function resolveDispute(req, res) {
  try {
    const { resolution, releasePercentage } = req.body;
    const { disputeId } = req.params;
    const dispute = await disputeModel.findById(disputeId);
    if (!dispute) {
      return res.status(400).json({ message: "Dispute does not exist" });
    }
    const milestone = await milestoneModel.findById(dispute.milestone);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    milestone.status = "released";
    await milestone.save();
    dispute.status = "resolved";
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user.id;
    dispute.releasePercentage = releasePercentage;
    await dispute.save();
    return res.status(200).json({ message: "Dispute resolved successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function submitEvidence(req, res) {
  try {
    const { disputeId } = req.params;
    const { evidence } = req.body;
    const dispute = await disputeModel.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: "Dispute does not exist" });
    }
    if (dispute.status === "resolved") {
      return res.status(400).json({ message: "Evidence can be submitted only to open or underreviewd disputes" });
    }
    const contract=await contractModel.findById(dispute.contract);
    const userId=req.user.id;
    const isClient=contract.client.toString()===userId.toString();
    const isFreelancer=contract.freelancer.toString()===userId.toString();
    if(!isClient && !isFreelancer){
      return res.status(403).json({message:"You are not part of this contract"});
    }
    if (isClient) {
      dispute.clientEvidence = evidence;
    }
    else {
      dispute.freelancerEvidence = evidence;
    }
    await dispute.save();
    return res.status(200).json({ message: "Evidence submitted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
  }
}

export async function getMyDisputes(req, res) {
  try {
    const userId = req.user.id;
    const contracts = await contractModel.find({
      $or: [{ client: userId }, { freelancer: userId }]
    });
    const contractIds = contracts.map(function(c) { return c._id; });
    const disputes = await disputeModel
      .find({ contract: { $in: contractIds } })
      .populate("milestone", "title amount")
      .populate("contract", "title")
      .populate("raisedBy", "username")
      .sort({ createdAt: -1 });
    return res.status(200).json({ disputes });
  } catch (err) {
    console.error("getMyDisputes error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}
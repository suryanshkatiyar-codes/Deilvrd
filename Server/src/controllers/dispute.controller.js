import disputeModel from "../models/dispute.model.js";
import milestoneModel from "../models/milestone.model.js";
import userModel from "../models/user.model.js";
import contractModel from "../models/contract.model.js";
import { sendEmail } from "../utils/email.js";

export async function raiseDispute(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "submitted") {
      return res.status(400).json({ message: "Only submitted milestone can be disputed" })
    }
    milestone.status = "disputed";
    await milestone.save();
    const userId = req.user.Id;
    const dispute = await disputeModel.create({
      milestone: milestoneId,
      contract: milestone.contract,
      raisedBy: userId,
      status: "open",
    })

    // fetch client and freelancer emails
    const contract = await contractModel.findById(milestone.contract)
      .populate("client", "name email")
      .populate("freelancer", "name email");

    await sendEmail(
      contract.client.email,
      "Dispute Raised on Your Contract",
      `<p>Hi ${contract.client.name}, a dispute has been raised on milestone <b>${milestone.title}</b>. Our team will review it shortly.</p>`
    );

    await sendEmail(
      contract.freelancer.email,
      "Dispute Raised on Your Contract",
      `<p>Hi ${contract.freelancer.name}, a dispute has been raised on milestone <b>${milestone.title}</b>. Our team will review it shortly.</p>`
    );

    return res.status(200).json({ message: "Dispute created successfully" });
  } catch (err) {
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
    dispute.resolvedBy = req.user.Id;
    dispute.releasePercentage = releasePercentage;
    await dispute.save();
    return res.status(200).json({ message: "Dispute resolved successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}
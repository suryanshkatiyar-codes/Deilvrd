import milestoneModel from "../models/milestone.model.js";
import contractModel from "../models/contract.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function fundMilestone(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "pending") {
      return res.status(400).json({ message: "You can only approve pending milestones only" });
    }
    milestone.status = "funded";
    await milestone.save();
    return res.status(200).json({ message: "Milestone funded successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function submitMilestone(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "funded") {
      return res.status(400).json({ message: "You can only submit funded milestones only" });
    }
    milestone.status = "submitted";
    milestone.submittedAt = Date.now();
    if (req.file) {
      milestone.deliverableUrl = req.file.path;
    }
    await milestone.save();
    return res.status(200).json({ message: "Milestone submitted successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function approveMilestone(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "submitted") {
      return res.status(400).json({ message: "You can only approve submitted milestones only" });
    }
    milestone.status = "approved";
    await milestone.save();
    return res.status(200).json({ message: "Milestone approved successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function disputeMilestone(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "submitted") {
      return res.status(400).json({ message: "You can only dispute submitted milestones only" });
    }
    milestone.status = "disputed";
    await milestone.save();
    return res.status(200).json({ message: "Milestone disputed successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function releaseMilestone(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "approved" && milestone.status !== "disputed") {
      return res.status(400).json({ message: "You can only release approved or disputed milestones only" });
    }
    milestone.status = "released";
    await milestone.save();

    // fetch freelancer email
    const contract = await contractModel.findById(milestone.contract)
      .populate("freelancer", "name email");

    await sendEmail(
      contract.freelancer.email,
      "Milestone Payment Released",
      `<p>Hi ${contract.freelancer.name}, your payment for milestone <b>${milestone.title}</b> has been released. You can download your invoice from the platform.</p>`
    );

    return res.status(200).json({ message: "Milestone released successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function downloadInvoice(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "released") {
      return res.status(400).json({ message: "Invoice only available for released milestones" });
    }
    generateInvoice(milestone, res);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function getMyMilestones(req, res) {
  try {
    const userId = req.user.id;
    const milestones = await milestoneModel
      .find({ $or: [{ client: userId }, { freelancer: userId }] })
      .populate("contract", "title")
      .sort({ createdAt: -1 });
    return res.status(200).json({ milestones });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}
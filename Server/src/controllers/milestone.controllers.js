import milestoneModel from "../models/milestone.model.js";
import upload from "../config/cloudinary.js"
import { io } from "../../server.js";

export async function fundMilestone(req, res) {
  try {
    const { milestoneId } = req.params;
    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(400).json({ message: "Milestone does not exist" });
    }
    if (milestone.status !== "pending") {
      return res.status(400).json({ message: "You can only approve pending milestones only" })
    }
    milestone.status = "funded";
    await milestone.save();
    return res.status(200).json({ message: "Milestone funded successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
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
      return res.status(400).json({ message: "You can only submit funded milestones only" })
    }
    milestone.status = "submitted";
    milestone.submittedAt = Date.now();
    if (req.file) {
      milestone.deliverableUrl = req.file.path;
    }
    await milestone.save();
    io.to(milestone.client.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });

    io.to(milestone.freelancer.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });
    return res.status(200).json({ message: "Milestone submitted successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
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
    io.to(milestone.client.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });

    io.to(milestone.freelancer.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });
    return res.status(200).json({ message: "Milestone approved successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
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
      return res.status(400).json({ message: "You can only dispute submitted milestones only" })
    }
    milestone.status = "disputed";
    await milestone.save();
    io.to(milestone.client.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });

    io.to(milestone.freelancer.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });
    return res.status(200).json({ message: "Milestone disputed successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
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
      return res.status(400).json({ message: "You can only release approved or disputed milestones only" })
    }
    milestone.status = "released";
    await milestone.save();
    io.to(milestone.client.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });

    io.to(milestone.freelancer.toString()).emit("milestoneUpdate", {
      milestoneId: milestone._id,
      status: milestone.status,
    });
    return res.status(200).json({ message: "Milestone released successfully", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
  }
}


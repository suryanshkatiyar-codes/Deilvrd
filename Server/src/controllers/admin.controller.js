import userModel from "../models/user.model.js";
import disputeModel from "../models/dispute.model.js";
import milestoneModel from "../models/milestone.model.js";

export async function getAllDisputes(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const allDisputes = await disputeModel
      .find({ status: "open" })
      .populate("milestone")
      .populate("contract")
      .sort({ createdAt: 1 }) // oldest first
      .skip(skip)
      .limit(limit);

    if (allDisputes.length === 0) {
      return res.status(200).json({ message: "No open disputes" });
    }
    return res.status(200).json({ message: "All disputes obtained successfully", allDisputes });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const users = await userModel
      .find()
      .select("name email role kyc createdAt")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ message: "All users obtained successfully", users });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function banUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    user.isBanned = true;
    await user.save();
    return res.status(200).json({ message: "User banned successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function getAnalytics(req, res) {
  try {
    // total escrow held — sum of all funded milestones
    const escrowHeld = await milestoneModel.aggregate([
      { $match: { status: "funded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // total released this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const releasedThisMonth = await milestoneModel.aggregate([
      { $match: { status: "released", updatedAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // count of open disputes
    const openDisputes = await disputeModel.countDocuments({ status: "open" });

    return res.status(200).json({
      message: "Analytics obtained successfully",
      analytics: {
        escrowHeld: escrowHeld[0]?.total || 0,
        releasedThisMonth: releasedThisMonth[0]?.total || 0,
        openDisputes,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}
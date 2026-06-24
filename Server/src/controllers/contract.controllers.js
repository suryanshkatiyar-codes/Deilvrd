import userModel from "../models/user.model.js";
import contractModel from "../models/contract.model.js";
import milestoneModel from "../models/milestone.model.js";

export async function generateContract(req, res) {
  try {
    const { freelancerEmail, title, description, amount, milestones } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (user.kyc.status !== "verified") {
      return res.status(403).json({ message: "Verify your KYC first" });
    }

    if (!freelancerEmail || !title || !description || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const freelancer = await userModel.findOne({ email: freelancerEmail });
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }
    if (freelancer.role !== "Freelancer") {
      return res.status(400).json({ message: "That user is not a freelancer" });
    }

    const newContract = await contractModel.create({
      client: userId,
      freelancer: freelancer._id,
      title,
      description,
      amount,
    });

    let createdMilestones = [];
    if (milestones && milestones.length > 0) {
      const milestoneData = milestones.map(function(m) {
        return {
          contract: newContract._id,
          client: userId,
          freelancer: freelancer._id,
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate || null,
        };
      });
      createdMilestones = await milestoneModel.insertMany(milestoneData);
    }

    return res.status(201).json({
      message: "New contract created successfully",
      contract: newContract,
      milestones: createdMilestones,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getContracts(req, res) {
  try {
    const userId = req.user.id;
    const contracts = await contractModel
      .find({ $or: [{ client: userId }, { freelancer: userId }] })
      .populate("client", "username email")
      .populate("freelancer", "username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ contracts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getContractById(req, res) {
  try {
    const userId = req.user.id;
    const contract = await contractModel
      .findById(req.params.id)
      .populate("client", "username email")
      .populate("freelancer", "username email");

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const isParty = contract.client._id.toString() === userId.toString() ||
      contract.freelancer._id.toString() === userId.toString();
    if (!isParty) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const milestones = await milestoneModel.find({ contract: contract._id });

    return res.status(200).json({ contract, milestones });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
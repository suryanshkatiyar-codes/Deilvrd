import userModel from "../models/user.model.js";
import contractModel from "../models/contract.model.js";

export async function generateContract(req, res) {
  try {
    const { freelancerId, title, description, amount } = req.body;
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (user.kyc.status !== "verified") {
      return res.status(403).json({ message: "Verify your kyc first" })
    }
    if (!freelancerId || !title || !description || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newContract = await contractModel.create({
      client: userId,
      freelancer: freelancerId,
      title,
      description,
      amount,
    })

    return res.status(201).json({ message: "New contract created successfully", newContract })
  } catch (err) {
    return res.status(500).json({ message: "Sever error" });
  }
}
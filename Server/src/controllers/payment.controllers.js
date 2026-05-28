import milestoneModel from "../models/milestone.model.js";
import processedPaymentModel from "../models/processedPayment.model.js";
import { createOrder as mockCreateOrder, verifyPayment as mockVerifyPayment } from "../config/mockPayment.js";

export async function createOrder(req, res) {
  try {
    const { milestoneId } = req.body;

    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const order = mockCreateOrder({
      amount: milestone.amount,
      milestoneId,
    });

    milestone.razorpay_order_id = order.orderId;
    await milestone.save();

    return res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { orderId, paymentId, milestoneId } = req.body;

    const isValid = mockVerifyPayment({ orderId, paymentId });
    if (!isValid) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const milestone = await milestoneModel.findById(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    milestone.status = "funded";
    await milestone.save();

    return res.status(200).json({ message: "Payment verified, milestone funded", milestone });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function webhookHandler(req, res) {
  try {
    const { event, paymentId, orderId } = req.body;

    // idempotency check — skip if already processed
    const alreadyProcessed = await processedPaymentModel.findOne({ paymentId });
    if (alreadyProcessed) {
      return res.status(200).json({ message: "Already processed" });
    }

    // save paymentId first before processing
    await processedPaymentModel.create({ paymentId });

    if (event === "payment.captured") {
      const milestone = await milestoneModel.findOne({ razorpay_order_id: orderId });
      if (milestone) {
        milestone.status = "funded";
        await milestone.save();
      }
    }

    if (event === "payment.failed") {
      const milestone = await milestoneModel.findOne({ razorpay_order_id: orderId });
      if (milestone) {
        milestone.status = "pending";
        await milestone.save();
      }
    }

    // always return 200 immediately — never make the gateway wait
    return res.status(200).json({ message: "Webhook processed" });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}
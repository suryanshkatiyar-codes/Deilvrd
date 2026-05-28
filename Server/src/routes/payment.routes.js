import { Router } from "express";
import { createOrder, verifyPayment, webhookHandler } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/webhook", webhookHandler);

export default router;
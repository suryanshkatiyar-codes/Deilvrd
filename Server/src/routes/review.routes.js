import { Router } from "express";
import { protect } from "../middleware/auth.js"
import { roleCheck } from "../middleware/roleCheck.js"
import { submitReview, getUserReviews } from "../controllers/review.controller.js";

const router = Router();

router.post("/:contractId", protect, roleCheck("Client", "Freelancer"), submitReview);
router.get("/user/:userId", protect, getUserReviews);

export default router;
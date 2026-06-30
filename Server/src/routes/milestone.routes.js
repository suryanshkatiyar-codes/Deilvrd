import { Router } from "express";
import { approveMilestone, disputeMilestone, fundMilestone, releaseMilestone, submitMilestone, downloadInvoice, getMyMilestones } from "../controllers/milestone.controllers.js";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.post("/fund/:milestoneId", protect, roleCheck("Client"), fundMilestone);
router.post("/submit/:milestoneId", protect, roleCheck("Freelancer"), submitMilestone);
router.post("/approve/:milestoneId", protect, roleCheck("Client"), approveMilestone);
router.post("/dispute/:milestoneId", protect, roleCheck("Client"), disputeMilestone);
router.post("/release/:milestoneId", protect, roleCheck("Client"), releaseMilestone);
router.get("/:milestoneId/invoice", protect, downloadInvoice);
router.get("/my", protect, getMyMilestones);

export default router;
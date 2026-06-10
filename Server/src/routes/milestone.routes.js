import { Router } from "express";
import { approveMilestone, disputeMilestone, fundMilestone, releaseMilestone, submitMilestone, downloadInvoice } from "../controllers/milestone.controllers.js";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { upload } from "../config/cloudinary.js";

const router=Router()

router.post("/fundmilestone/:milestoneId",protect,roleCheck("Client"),fundMilestone);
router.post("/submitmilestone/:milestoneId",protect,roleCheck("Freelancer"),upload.single("deliverable"),submitMilestone);
router.post("/approvemilestone/:milestoneId",protect,roleCheck("Client"),approveMilestone);
router.post("/disputemilestone/:milestoneId",protect,roleCheck("Client"),disputeMilestone);
router.post("/releasemilestone/:milestoneId",protect,roleCheck("Client"),releaseMilestone);
router.get("/:milestoneId/invoice", protect, downloadInvoice);

export default router;
import { Router } from "express";
import { approveMilestone, disputeMilestone, fundMilestone, releaseMilestone, submitMilestone } from "../controllers/milestone.controllers.js";
import { protect } from "../middleware/auth.j";
import { roleCheck } from "../middleware/roleCheck.js";
import { upload } from "../config/cloudinary.js";

const router=Router()

router.post("/fundmilestone/:milestoneId",protect,roleCheck("client"),fundMilestone);
router.post("/submitmilestone/:milestoneId",protect,roleCheck("freelancer"),upload.single("deliverable"),submitMilestone);
router.post("/approvemilestone/:milestoneId",protect,roleCheck("client"),approveMilestone);
router.post("/disputemilestone/:milestoneId",protect,roleCheck("client"),disputeMilestone);
router.post("/releasemilestone/:milestoneId",protect,roleCheck("client"),releaseMilestone);

export default router;
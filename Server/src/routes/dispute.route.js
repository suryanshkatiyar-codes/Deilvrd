import { Router } from "express";
import { raiseDispute, viewDispute, resolveDispute } from "../controllers/dispute.controller.js";
import {protect} from "../middleware/auth.js"
import { roleCheck } from "../middleware/roleCheck.js";

const router=Router();

router.post("/:milestoneId",protect,roleCheck("Client","Freelancer"),raiseDispute);
router.get("/:disputeId",protect,viewDispute);
router.patch("/:disputeId/resolve",protect,roleCheck("Admin"),resolveDispute)

export default router;
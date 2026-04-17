import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { generateContract } from "../controllers/contract.controllers.js";

const router=Router()

router.post("generate-contract",protect,roleCheck("user"),generateContract);

export default router;
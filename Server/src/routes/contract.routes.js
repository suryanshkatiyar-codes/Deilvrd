import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { generateContract, getContracts, getContractById } from "../controllers/contract.controllers.js";

const router = Router();

router.post("/", protect, roleCheck("Client"), generateContract);
router.get("/", protect, getContracts);
router.get("/:id", protect, getContractById);

export default router;
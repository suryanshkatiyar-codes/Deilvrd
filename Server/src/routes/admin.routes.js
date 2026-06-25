import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";
import { getAllDisputes, getAllUsers, banUser, getAnalytics } from "../controllers/admin.controller.js";

const router = Router();

router.get("/disputes", protect, roleCheck("Admin"), getAllDisputes);
router.get("/users", protect, roleCheck("Admin"), getAllUsers);
router.patch("/users/:userId/ban", protect, roleCheck("Admin"), banUser);
router.get("/analytics", protect, roleCheck("Admin"), getAnalytics);

export default router;
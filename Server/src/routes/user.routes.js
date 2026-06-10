import { register, login, refresh, kycSubmit,kycVerify ,logout } from "../controllers/user.controllers.js";
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout",protect,logout);
router.get("/refresh", refresh)
router.patch("/kyc-submit",protect,kycSubmit);
router.patch("/kyc-verify/:userId",protect,roleCheck('Admin'),kycVerify);

export default router;


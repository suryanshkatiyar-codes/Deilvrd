import { register, login, refresh, kycSubmit } from "../controllers/user.controllers";
import { Router } from "express";
import { protect } from "../middleware/auth";
import { roleCheck } from "../middleware/roleCheck";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh)
router.patch("/kyc-submit",protect,kycSubmit);
router.patch("/kyc-verify/:userId",protect,roleCheck('admin'),kycVerify);

export default router;


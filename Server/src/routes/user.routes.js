import { register, login, refresh } from "../controllers/user.controllers";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh)

export default router;


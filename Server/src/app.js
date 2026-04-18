import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import contractRouter from "./routes/contract.routes.js"
import milestoneRouter from "./routes/milestone.routes.js"
import autoRelease from "./cron/autoRelease.js";

const app = express();

app.use(cookieParser());
app.use(express.json());
autoRelease.start();

app.use("/api/auth", userRouter);
app.use("/api/users", userRouter);
app.use("/api/contract",contractRouter);
app.use("/api/milestone",milestoneRouter);

export default app;
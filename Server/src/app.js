import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import contractRouter from "./routes/contract.routes.js"

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", userRouter);
app.use("/api/users", userRouter);
app.use("/api/contract",contractRouter);

export default app;
import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import contractRouter from "./routes/contract.routes.js"
import milestoneRouter from "./routes/milestone.routes.js"
import disputeRouter from "./routes/dispute.route.js"
import adminRouter from "./routes/admin.routes.js";
import reviewRouter from "./routes/review.routes.js"
import autoRelease from "./cron/autoRelease.js";
import paymentRouter from "./routes/payment.routes.js"
import { rateLimit } from "express-rate-limit";
import cors from 'cors';

const app = express();

// general limiter — all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests, please try again later" },
});

// strict limiter — payment routes only
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many payment requests, please try again later" },
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(generalLimiter);
autoRelease.start();

app.use("/api/auth", userRouter);
app.use("/api/users", userRouter);
app.use("/api/contract", contractRouter);
app.use("/api/milestone", milestoneRouter);
app.use("/api/payments", paymentLimiter, paymentRouter);
app.use("/api/disputes", disputeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);

export default app;
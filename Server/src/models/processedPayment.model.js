import mongoose from "mongoose";

const processedPaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const processedPaymentModel = mongoose.model("ProcessedPayment", processedPaymentSchema);
export default processedPaymentModel;
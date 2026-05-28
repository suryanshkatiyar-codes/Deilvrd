export function createOrder({ amount, milestoneId }) {
  return {
    orderId:"order_" + Date.now(),
    amount,
    milestoneId,
    status: "created"
  };

}

export function verifyPayment({ orderId, paymentId }) {
  return true;
}

export function mockWebhookPayload(orderId, paymentId, event) {
  return {
    event,
    orderId,
    paymentId,
    timestamp:Date.now(),
  }
}
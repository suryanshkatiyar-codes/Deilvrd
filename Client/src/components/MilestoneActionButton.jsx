import { useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function getActionConfig(action) {
  if (action === "fund")    return { label: "Fund",          endpoint: "fund",    cls: "bg-blue-500 hover:bg-blue-600 text-white" };
  if (action === "submit")  return { label: "Submit Work",   endpoint: "submit",  cls: "bg-brand-500 hover:bg-brand-600 text-white" };
  if (action === "approve") return { label: "Approve",       endpoint: "approve", cls: "bg-brand-500 hover:bg-brand-600 text-white" };
  if (action === "dispute") return { label: "Raise Dispute", endpoint: "dispute", cls: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-400/30" };
  if (action === "release") return { label: "Release",       endpoint: "release", cls: "bg-brand-500 hover:bg-brand-600 text-white" };
  return null;
}

export default function MilestoneActionButton(props) {
  const action = props.action;
  const milestoneId = props.milestoneId;
  const onSuccess = props.onSuccess;

  const { showToast } = useToast();
  const [isLoading, setLoading] = useState(false);

  const config = getActionConfig(action);
  if (!config) return null;

  const cls = "text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 " + config.cls;

  function handleClick() {
    setLoading(true);

    if (action === "fund") {
      api.post("/payments/create-order", { milestoneId: milestoneId })
        .then(function(res) {
          const orderId = res.data.order.orderId;
          const paymentId = "pay_" + Date.now();
          return api.post("/payments/verify", {
            orderId: orderId,
            paymentId: paymentId,
            milestoneId: milestoneId,
          });
        })
        .then(function() {
          showToast("Milestone funded successfully");
          if (onSuccess) onSuccess();
        })
        .catch(function(err) {
          const msg = err.response && err.response.data && err.response.data.message
            ? err.response.data.message : "Payment failed";
          showToast(msg, "error");
        })
        .finally(function() { setLoading(false); });
      return;
    }

    if (action === "dispute") {
      api.post("/milestone/" + config.endpoint + "/" + milestoneId)
        .then(function() {
          return api.post("/disputes/" + milestoneId);
        })
        .then(function() {
          showToast("Dispute raised successfully");
          if (onSuccess) onSuccess();
        })
        .catch(function(err) {
          const msg = err.response && err.response.data && err.response.data.message
            ? err.response.data.message : "Action failed";
          showToast(msg, "error");
        })
        .finally(function() { setLoading(false); });
      return;
    }

    api.post("/milestone/" + config.endpoint + "/" + milestoneId)
      .then(function() {
        showToast("Action completed successfully");
        if (onSuccess) onSuccess();
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message : "Action failed";
        showToast(msg, "error");
      })
      .finally(function() { setLoading(false); });
  }

  return (
    <button onClick={handleClick} disabled={isLoading} className={cls}>
      {isLoading ? "..." : config.label}
    </button>
  );
}
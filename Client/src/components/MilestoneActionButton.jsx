import { useState } from "react";
import api from "../api/axios";

function getActionConfig(action) {
  if (action === "fund")    return { label: "Fund",          endpoint: "fund",    cls: "bg-blue-500 hover:bg-blue-600 text-white" };
  if (action === "submit")  return { label: "Submit Work",   endpoint: "submit",  cls: "bg-brand-500 hover:bg-brand-600 text-white" };
  if (action === "approve") return { label: "Approve",       endpoint: "approve", cls: "bg-brand-500 hover:bg-brand-600 text-white" };
  if (action === "dispute") return { label: "Raise Dispute", endpoint: "dispute", cls: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-400/30" };
  if (action === "release") return { label: "Release",       endpoint: "release", cls: "bg-brand-500 hover:bg-brand-600 text-white" };
  return null;
}

export default function MilestoneActionButton(props) {
  var action = props.action;
  var milestoneId = props.milestoneId;
  var onSuccess = props.onSuccess;

  var loading = useState(false);
  var isLoading = loading[0];
  var setLoading = loading[1];

  var config = getActionConfig(action);
  if (!config) return null;

  var label = config.label;
  var endpoint = config.endpoint;
  var cls = "text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 " + config.cls;

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
        if (onSuccess) onSuccess();
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message : "Payment failed";
        alert(msg);
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
        if (onSuccess) onSuccess();
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message : "Action failed";
        alert(msg);
      })
      .finally(function() { setLoading(false); });
    return;
  }

  api.post("/milestone/" + config.endpoint + "/" + milestoneId)
    .then(function() {
      if (onSuccess) onSuccess();
    })
    .catch(function(err) {
      const msg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message : "Action failed";
      alert(msg);
    })
    .finally(function() { setLoading(false); });
}

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cls}
    >
      {isLoading ? "..." : label}
    </button>
  );
}
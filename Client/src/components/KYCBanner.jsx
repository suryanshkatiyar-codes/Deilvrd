import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

export default function KYCBanner() {
  const auth = useAuth();
  const user = auth.user;
  const { showToast } = useToast();

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const kycStatus = user
    ? (user.kycStatus || (user.kyc ? user.kyc.status : "pending"))
    : "pending";

  if (kycStatus === "verified" || done) return null;

  function handleSubmit() {
    setLoading(true);
    api.patch("/users/kyc-submit")
      .then(function() {
        setDone(true);
        showToast("KYC submitted successfully");
      })
      .catch(function(err) {
        const msg = err.response && err.response.data
          ? err.response.data.message : "Failed";
        showToast(msg, "error");
      })
      .finally(function() { setLoading(false); });
  }

  if (kycStatus === "submitted") {
    return (
      <div className="mb-6 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-yellow-400 text-sm font-medium">KYC under review</p>
          <p className="text-muted text-xs mt-0.5">You cannot create contracts yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-brand-500/5 border border-brand-500/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-white text-sm font-medium">Complete your KYC</p>
        <p className="text-muted text-xs mt-0.5">Required before creating or accepting contracts.</p>
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="shrink-0 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
      >
        {loading ? "Submitting..." : "Submit KYC"}
      </button>
    </div>
  );
}
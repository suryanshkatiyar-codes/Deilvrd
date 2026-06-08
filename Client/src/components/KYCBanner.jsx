import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function KYCBanner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  if (user?.kycStatus === "verified" || done) return null;
  if (user?.kycStatus === "submitted") {
    return (
      <div className="mb-6 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-yellow-400 text-sm font-medium">KYC under review</p>
          <p className="text-muted text-xs mt-0.5">We'll notify you once verified. You can't create contracts yet.</p>
        </div>
        <span className="text-yellow-400 text-xl">⏳</span>
      </div>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.patch("/users/kyc-submit");
      setDone(true);
    } catch {
      // fail silently — user can retry
    } finally {
      setLoading(false);
    }
  };

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
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pageTitles = {
  "/dashboard":  "Dashboard",
  "/contracts":  "Contracts",
  "/milestones": "Milestones",
  "/disputes":   "Disputes",
  "/reviews":    "Reviews",
  "/admin":      "Admin Panel",
};

export default function Topbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const title = pageTitles[pathname] || "Delivrd";
  const kycStatus = user?.kycStatus; // "pending" | "submitted" | "verified"

  return (
    <header className="h-16 border-b border-line bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-10">
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-3">
        {kycStatus !== "verified" && (
          <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full">
            KYC {kycStatus === "submitted" ? "under review" : "not submitted"}
          </span>
        )}
        {kycStatus === "verified" && (
          <span className="text-xs bg-brand-500/10 text-brand-500 border border-brand-500/20 px-3 py-1 rounded-full">
            ✓ KYC verified
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 text-sm font-medium">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
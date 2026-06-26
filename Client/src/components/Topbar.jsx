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

export default function Topbar(props) {
  const onMenuClick = props.onMenuClick;
  const auth = useAuth();
  const user = auth.user;
  const location = useLocation();
  const pathname = location.pathname;
  const title = pageTitles[pathname] || "Delivrd";
  const kycStatus = user ? (user.kycStatus || (user.kyc ? user.kyc.status : "pending")) : "pending";
  const initial = user && user.username ? user.username[0].toUpperCase() : "?";

  function renderKycBadge() {
    if (kycStatus === "verified") {
      return (
        <span className="text-xs bg-brand-500/10 text-brand-500 border border-brand-500/20 px-3 py-1 rounded-full">
          KYC verified
        </span>
      );
    }
    const label = kycStatus === "submitted" ? "KYC under review" : "KYC pending";
    return (
      <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full">
        {label}
      </span>
    );
  }

  return (
    <header className="h-16 border-b border-line bg-card/50 backdrop-blur-sm px-4 lg:px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted hover:text-white transition-colors p-1"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1"/>
            <rect y="9" width="20" height="2" rx="1"/>
            <rect y="15" width="20" height="2" rx="1"/>
          </svg>
        </button>
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="hidden sm:block">{renderKycBadge()}</div>
        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 text-sm font-medium">
          {initial}
        </div>
      </div>
    </header>
  );
}
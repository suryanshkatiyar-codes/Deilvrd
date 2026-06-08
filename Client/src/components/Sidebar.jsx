import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard",  to: "/dashboard",  icon: "▦" },
  { label: "Contracts",  to: "/contracts",  icon: "◈" },
  { label: "Milestones", to: "/milestones", icon: "◎" },
  { label: "Disputes",   to: "/disputes",   icon: "⚑" },
  { label: "Reviews",    to: "/reviews",    icon: "★" },
];

const adminItems = [
  { label: "Admin Panel", to: "/admin", icon: "⬡" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const links = user?.role === "admin"
    ? [...navItems, ...adminItems]
    : navItems;

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-line flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-line">
        <h1 className="font-display text-xl font-bold text-gradient">Delivrd</h1>
        <p className="text-xs text-muted mt-0.5">Escrow platform</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
              ${isActive
                ? "bg-brand-500/15 text-brand-500 font-medium"
                : "text-muted hover:text-gray-200 hover:bg-white/5"}`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-line">
        <div className="mb-3">
          <p className="text-sm text-white font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-muted hover:text-red-400 transition-colors py-1"
        >
          → Sign out
        </button>
      </div>
    </aside>
  );
}
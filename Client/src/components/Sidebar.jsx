import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard",  to: "/dashboard" },
  { label: "Contracts",  to: "/contracts" },
  { label: "Milestones", to: "/milestones" },
  { label: "Disputes",   to: "/disputes" },
  { label: "Reviews",    to: "/reviews" },
];

const adminItems = [
  { label: "Admin Panel", to: "/admin" },
];

export default function Sidebar(props) {
  const auth = useAuth();
  const user = auth.user;
  const logout = auth.logout;
  const navigate = useNavigate();
  const onClose = props.onClose;

  function handleLogout() {
    logout().then(function() {
      navigate("/login");
    });
  }

  function handleNavClick() {
    if (onClose) onClose();
  }

  const isAdmin = user && user.role === "Admin";
  const links = isAdmin ? adminItems : navItems;

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-line flex flex-col">
      <div className="px-6 py-6 border-b border-line">
        <h1 className="font-display text-xl font-bold text-gradient">Delivrd</h1>
        <p className="text-xs text-muted mt-0.5">Escrow platform</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(function(item) {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={function(p) {
                return "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all " +
                  (p.isActive
                    ? "bg-brand-500/15 text-brand-500 font-medium"
                    : "text-muted hover:text-gray-200 hover:bg-white/5");
              }}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-line">
        <div className="mb-3">
          <p className="text-sm text-white font-medium">{user ? user.username : ""}</p>
          <p className="text-xs text-muted capitalize">{user ? user.role : ""}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-muted hover:text-red-400 transition-colors py-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
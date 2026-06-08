import { useAuth } from "../context/AuthContext";
import KYCBanner from "../components/KYCBanner";
import useFetch from "../hooks/useFetch";
import { Link } from "react-router-dom";

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-card border border-line rounded-2xl px-5 py-5">
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white font-display text-3xl font-bold mt-1">{value ?? "—"}</p>
      {sub && <p className="text-muted text-xs mt-1">{sub}</p>}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    active:    "bg-brand-500/10 text-brand-500",
    completed: "bg-blue-500/10 text-blue-400",
    disputed:  "bg-red-500/10 text-red-400",
    pending:   "bg-yellow-400/10 text-yellow-400",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${map[status] || "bg-white/10 text-gray-400"}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: contracts, loading } = useFetch("/contracts");

  const list = contracts?.contracts || contracts || [];

  const active    = list.filter((c) => c.status === "active").length;
  const completed = list.filter((c) => c.status === "completed").length;
  const disputed  = list.filter((c) => c.status === "disputed").length;

  return (
    <div>
      <KYCBanner />

      {/* Welcome */}
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-white">
          Hey, {user?.name?.split(" ")[0]} 👋
        </h3>
        <p className="text-muted text-sm mt-1">Here's what's happening with your contracts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Contracts" value={list.length} />
        <StatCard label="Active"          value={active}    sub="In progress" />
        <StatCard label="Completed"       value={completed} sub="All milestones released" />
      </div>

      {/* Recent contracts */}
      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h4 className="text-white font-medium text-sm">Recent Contracts</h4>
          <Link to="/contracts" className="text-brand-500 text-xs hover:text-brand-400 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-muted text-sm">Loading...</div>
        ) : list.length === 0 ? (
          <div className="px-5 py-8 text-center text-muted text-sm">No contracts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted uppercase tracking-wider">
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">
                  {user?.role === "client" ? "Freelancer" : "Client"}
                </th>
                <th className="text-left px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 5).map((c) => (
                <tr key={c._id} className="border-b border-line last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 text-white font-medium">{c.title}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {user?.role === "client" ? c.freelancer?.name : c.client?.name}
                  </td>
                  <td className="px-5 py-3.5 text-white">₹{c.amount?.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
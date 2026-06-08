import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";

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

export default function ContractsPage() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch("/contracts");
  const [search, setSearch] = useState("");

  const list = data?.contracts || data || [];
  const filtered = list.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">Contracts</h3>
          <p className="text-muted text-sm mt-0.5">{list.length} total</p>
        </div>
        {user?.role === "client" && (
          <Link
            to="/contracts/new"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            + New Contract
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contracts..."
          className="w-full max-w-sm bg-card border border-line rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center text-muted text-sm py-16">Loading contracts...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted text-sm py-16">
          {search ? "No contracts match your search." : "No contracts yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Link
              key={c._id}
              to={`/contracts/${c._id}`}
              className="block bg-card border border-line hover:border-brand-500/40 rounded-2xl px-5 py-4 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-medium text-sm group-hover:text-brand-500 transition-colors truncate">
                      {c.title}
                    </p>
                    <StatusPill status={c.status} />
                  </div>
                  <p className="text-muted text-xs truncate">{c.description}</p>
                  <p className="text-muted text-xs mt-2">
                    {user?.role === "client" ? "Freelancer" : "Client"}:{" "}
                    <span className="text-gray-400">
                      {user?.role === "client" ? c.freelancer?.name : c.client?.name}
                    </span>
                  </p>
                </div>
                <div className="ml-4 text-right shrink-0">
                  <p className="text-white font-display font-bold text-lg">
                    ₹{c.amount?.toLocaleString()}
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {c.milestones?.length || 0} milestone{c.milestones?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
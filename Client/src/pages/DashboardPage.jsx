import { useAuth } from "../context/AuthContext";
import KYCBanner from "../components/KYCBanner";
import useFetch from "../hooks/useFetch";
import { Link } from "react-router-dom";

function getStatCardClass() {
  return "bg-card border border-line rounded-2xl px-5 py-5";
}

function StatCard(props) {
  var label = props.label;
  var value = props.value;
  var sub = props.sub;
  return (
    <div className={getStatCardClass()}>
      <p className="text-muted text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white font-display text-3xl font-bold mt-1">{value != null ? value : "—"}</p>
      {sub ? <p className="text-muted text-xs mt-1">{sub}</p> : null}
    </div>
  );
}

function getStatusClass(status) {
  if (status === "active")    return "bg-brand-500/10 text-brand-500";
  if (status === "completed") return "bg-blue-500/10 text-blue-400";
  if (status === "disputed")  return "bg-red-500/10 text-red-400";
  if (status === "pending")   return "bg-yellow-400/10 text-yellow-400";
  return "bg-white/10 text-gray-400";
}

function StatusPill(props) {
  var status = props.status;
  var cls = "text-xs px-2.5 py-1 rounded-full capitalize font-medium " + getStatusClass(status);
  return (
    <span className={cls}>{status}</span>
  );
}

function getCounterpartName(c, role) {
  if (role === "Client") {
    return c.freelancer ? c.freelancer.username : "-";
  }
  return c.client ? c.client.username : "-";
}

function getCounterpartLabel(role) {
  if (role === "Client") return "Freelancer";
  return "Client";
}

export default function DashboardPage() {
  var auth = useAuth();
  var user = auth.user;
  var fetchResult = useFetch("/contract");
  var contracts = fetchResult.data;
  var loading = fetchResult.loading;

  var list = [];
  if (contracts && contracts.contracts) {
    list = contracts.contracts;
  } else if (contracts && Array.isArray(contracts)) {
    list = contracts;
  }

  var active    = 0;
  var completed = 0;
  var disputed  = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i].status === "active")    active++;
    if (list[i].status === "completed") completed++;
    if (list[i].status === "disputed")  disputed++;
  }

  var displayName = user ? user.username : "";
  var role = user ? user.role : "";

  function renderRows() {
    return list.slice(0, 5).map(function(c) {
      var amount = c.amount ? c.amount.toLocaleString() : "0";
      return (
        <tr key={c._id} className="border-b border-line last:border-0 hover:bg-white/5 transition-colors">
          <td className="px-5 py-3.5 text-white font-medium">{c.title}</td>
          <td className="px-5 py-3.5 text-muted">{getCounterpartName(c, role)}</td>
          <td className="px-5 py-3.5 text-white">{"Rs." + amount}</td>
          <td className="px-5 py-3.5">
            <StatusPill status={c.status} />
          </td>
        </tr>
      );
    });
  }

  function renderTable() {
    if (loading) {
      return <div className="px-5 py-8 text-center text-muted text-sm">Loading...</div>;
    }
    if (list.length === 0) {
      return <div className="px-5 py-8 text-center text-muted text-sm">No contracts yet.</div>;
    }
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted uppercase tracking-wider">
            <th className="text-left px-5 py-3">Title</th>
            <th className="text-left px-5 py-3">{getCounterpartLabel(role)}</th>
            <th className="text-left px-5 py-3">Amount</th>
            <th className="text-left px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {renderRows()}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      <KYCBanner />

      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-white">
          {"Hey, " + displayName + " \uD83D\uDC4B"}
        </h3>
        <p className="text-muted text-sm mt-1">{"Here's what's happening with your contracts."}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Contracts" value={list.length} />
        <StatCard label="Active"          value={active}    sub="In progress" />
        <StatCard label="Completed"       value={completed} sub="All milestones released" />
      </div>

      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h4 className="text-white font-medium text-sm">Recent Contracts</h4>
          <Link to="/contracts" className="text-brand-500 text-xs hover:text-brand-400 transition-colors">
            View all →
          </Link>
        </div>
        {renderTable()}
      </div>
    </div>
  );
}

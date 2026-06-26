import useFetch from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import MilestoneActionButton from "../components/MilestoneActionButton";

function getStatusClass(status) {
  if (status === "pending")   return "bg-gray-500/10 text-gray-400";
  if (status === "funded")    return "bg-blue-500/10 text-blue-400";
  if (status === "submitted") return "bg-yellow-400/10 text-yellow-400";
  if (status === "approved")  return "bg-brand-500/10 text-brand-500";
  if (status === "disputed")  return "bg-red-500/10 text-red-400";
  if (status === "released")  return "bg-emerald-500/10 text-emerald-400";
  return "bg-white/10 text-gray-400";
}

function StatusPill(props) {
  var status = props.status;
  var cls = "text-xs px-2.5 py-1 rounded-full capitalize font-medium " + getStatusClass(status);
  return <span className={cls}>{status}</span>;
}

function MilestoneRow(props) {
  var m = props.milestone;
  var role = props.role;
  var onAction = props.onAction;

  var actions = [];
  if (role === "Client") {
    if (m.status === "pending")   actions.push("fund");
    if (m.status === "submitted") { actions.push("approve"); actions.push("dispute"); }
    if (m.status === "disputed")  actions.push("release");
  }
  if (role === "Freelancer") {
    if (m.status === "funded") actions.push("submit");
  }

  var contractTitle = m.contract ? m.contract.title : "-";
  var contractId = m.contract ? m.contract._id : null;
  var amount = m.amount ? m.amount.toLocaleString() : "0";

  return (
    <div className="bg-card border border-line rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white text-sm font-medium">{m.title}</p>
            <StatusPill status={m.status} />
          </div>
          <p className="text-muted text-xs mb-1">{m.description}</p>
          {contractId
            ? (
              <Link
                to={"/contracts/" + contractId}
                className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
              >
                {"↗ " + contractTitle}
              </Link>
            )
            : null}
        </div>
        <div className="text-right shrink-0">
          <p className="text-white font-display font-bold">{"Rs." + amount}</p>
          <div className="flex gap-2 mt-2 justify-end flex-wrap">
            {actions.map(function(action) {
              return (
                <MilestoneActionButton
                  key={action}
                  action={action}
                  milestoneId={m._id}
                  onSuccess={onAction}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MilestonesPage() {
  var auth = useAuth();
  var user = auth.user;
  var role = user ? user.role : "";

  var fetchResult = useFetch("/milestone/my");
  var data = fetchResult.data;
  var loading = fetchResult.loading;
  var error = fetchResult.error;
  var refetch = fetchResult.refetch;

  var milestones = [];
  if (data && data.milestones) {
    milestones = data.milestones;
  }

  var pending   = milestones.filter(function(m) { return m.status === "pending"; }).length;
  var funded    = milestones.filter(function(m) { return m.status === "funded"; }).length;
  var released  = milestones.filter(function(m) { return m.status === "released"; }).length;

  function renderContent() {
    if (loading) {
      return <div className="text-center text-muted text-sm py-16">Loading milestones...</div>;
    }
    if (error) {
      return (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </div>
      );
    }
    if (milestones.length === 0) {
      return <div className="text-center text-muted text-sm py-16">No milestones yet.</div>;
    }
    return (
      <div className="space-y-3">
        {milestones.map(function(m) {
          return (
            <MilestoneRow
              key={m._id}
              milestone={m}
              role={role}
              onAction={refetch}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-white">Milestones</h3>
        <p className="text-muted text-sm mt-0.5">{milestones.length + " total"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-line rounded-2xl px-5 py-4">
          <p className="text-muted text-xs uppercase tracking-wider">Pending</p>
          <p className="text-white font-display text-2xl font-bold mt-1">{pending}</p>
        </div>
        <div className="bg-card border border-line rounded-2xl px-5 py-4">
          <p className="text-muted text-xs uppercase tracking-wider">Funded</p>
          <p className="text-white font-display text-2xl font-bold mt-1">{funded}</p>
        </div>
        <div className="bg-card border border-line rounded-2xl px-5 py-4">
          <p className="text-muted text-xs uppercase tracking-wider">Released</p>
          <p className="text-white font-display text-2xl font-bold mt-1">{released}</p>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
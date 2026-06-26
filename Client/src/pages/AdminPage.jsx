import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function TabButton(props) {
  const label = props.label;
  const active = props.active;
  const onClick = props.onClick;
  const cls = "px-4 py-2 text-sm font-medium rounded-xl transition-colors " +
    (active ? "bg-brand-500/15 text-brand-500" : "text-muted hover:text-white");
  return (
    <button onClick={onClick} className={cls}>{label}</button>
  );
}

function AnalyticsTab() {
  const fetchResult = useFetch("/admin/analytics");
  const data = fetchResult.data;
  const loading = fetchResult.loading;

  if (loading) return <div className="text-center text-muted text-sm py-16">Loading...</div>;

  const analytics = data ? data.analytics : null;
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-card border border-line rounded-2xl px-5 py-5">
        <p className="text-muted text-xs uppercase tracking-wider">Escrow Held</p>
        <p className="text-white font-display text-2xl font-bold mt-1">{"Rs." + (analytics.escrowHeld || 0).toLocaleString()}</p>
      </div>
      <div className="bg-card border border-line rounded-2xl px-5 py-5">
        <p className="text-muted text-xs uppercase tracking-wider">Released This Month</p>
        <p className="text-white font-display text-2xl font-bold mt-1">{"Rs." + (analytics.releasedThisMonth || 0).toLocaleString()}</p>
      </div>
      <div className="bg-card border border-line rounded-2xl px-5 py-5">
        <p className="text-muted text-xs uppercase tracking-wider">Open Disputes</p>
        <p className="text-white font-display text-2xl font-bold mt-1">{analytics.openDisputes || 0}</p>
      </div>
    </div>
  );
}

function UsersTab() {
  const { showToast } = useToast();
  const fetchResult = useFetch("/admin/users");
  const data = fetchResult.data;
  const loading = fetchResult.loading;
  const refetch = fetchResult.refetch;

  const users = data ? (data.users || []) : [];

  function handleBan(userId) {
    api.patch("/admin/users/" + userId + "/ban")
      .then(function() {
        showToast("User banned successfully");
        refetch();
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message : "Failed to ban user";
        showToast(msg, "error");
      });
  }

  if (loading) return <div className="text-center text-muted text-sm py-16">Loading...</div>;

  return (
    <div className="bg-card border border-line rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted uppercase tracking-wider">
            <th className="text-left px-5 py-3">Username</th>
            <th className="text-left px-5 py-3">Email</th>
            <th className="text-left px-5 py-3">Role</th>
            <th className="text-left px-5 py-3">KYC</th>
            <th className="text-left px-5 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(function(u) {
            return (
              <tr key={u._id} className="border-b border-line last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5 text-white">{u.username}</td>
                <td className="px-5 py-3.5 text-muted">{u.email}</td>
                <td className="px-5 py-3.5 text-muted capitalize">{u.role}</td>
                <td className="px-5 py-3.5 text-muted">{u.kyc ? u.kyc.status : "-"}</td>
                <td className="px-5 py-3.5">
                  {u.isBanned
                    ? <span className="text-xs text-red-400">Banned</span>
                    : (
                      <button
                        onClick={function() { handleBan(u._id); }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Ban
                      </button>
                    )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DisputesTab() {
  const { showToast } = useToast();
  const fetchResult = useFetch("/admin/disputes");
  const data = fetchResult.data;
  const loading = fetchResult.loading;
  const refetch = fetchResult.refetch;

  const disputes = data ? (data.allDisputes || []) : [];

  const [resolving, setResolving] = useState(null);
  const [resolution, setResolution] = useState("");

  function handleResolve(disputeId) {
    if (!resolution.trim()) return;
    api.patch("/disputes/" + disputeId + "/resolve", { resolution: resolution, releasePercentage: 100 })
      .then(function() {
        setResolving(null);
        setResolution("");
        showToast("Dispute resolved successfully");
        refetch();
      })
      .catch(function(err) {
        const msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message : "Failed to resolve dispute";
        showToast(msg, "error");
      });
  }

  if (loading) return <div className="text-center text-muted text-sm py-16">Loading...</div>;
  if (disputes.length === 0) return <div className="text-center text-muted text-sm py-16">No open disputes.</div>;

  return (
    <div className="space-y-3">
      {disputes.map(function(d) {
        const milestoneTitle = d.milestone ? d.milestone.title : "-";
        const contractTitle = d.contract ? d.contract.title : "-";
        const isResolving = resolving === d._id;
        return (
          <div key={d._id} className="bg-card border border-line rounded-2xl px-5 py-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-white text-sm font-medium">{milestoneTitle}</p>
                <p className="text-muted text-xs">{"Contract: " + contractTitle}</p>
              </div>
              {!isResolving
                ? (
                  <button
                    onClick={function() { setResolving(d._id); }}
                    className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Resolve
                  </button>
                )
                : null}
            </div>
            {isResolving
              ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={resolution}
                    onChange={function(e) { setResolution(e.target.value); }}
                    rows={2}
                    placeholder="Resolution details..."
                    className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={function() { handleResolve(d._id); }}
                      className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={function() { setResolving(null); }}
                      className="border border-line text-muted hover:text-white text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
              : null}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const auth = useAuth();
  const user = auth.user;
  const role = user ? user.role : "";

  const [tab, setTab] = useState("analytics");

  if (role !== "Admin") {
    return (
      <div className="text-center text-muted text-sm py-16">Access denied.</div>
    );
  }

  function renderTab() {
    if (tab === "analytics") return <AnalyticsTab />;
    if (tab === "users")     return <UsersTab />;
    if (tab === "disputes")  return <DisputesTab />;
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-white">Admin Panel</h3>
        <p className="text-muted text-sm mt-0.5">Platform management</p>
      </div>

      <div className="flex gap-2 mb-6">
        <TabButton label="Analytics" active={tab === "analytics"} onClick={function() { setTab("analytics"); }} />
        <TabButton label="Users"     active={tab === "users"}     onClick={function() { setTab("users"); }} />
        <TabButton label="Disputes"  active={tab === "disputes"}  onClick={function() { setTab("disputes"); }} />
      </div>

      {renderTab()}
    </div>
  );
}
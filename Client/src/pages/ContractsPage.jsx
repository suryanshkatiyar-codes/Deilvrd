import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";

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
  if (role === "client") {
    return c.freelancer ? c.freelancer.username : "-";
  }
  return c.client ? c.client.username : "-";
}

function getCounterpartLabel(role) {
  if (role === "client") return "Freelancer";
  return "Client";
}

export default function ContractsPage() {
  var auth = useAuth();
  var user = auth.user;
  var role = user ? user.role : "";

  var fetchResult = useFetch("/contract");
  var data = fetchResult.data;
  var loading = fetchResult.loading;
  var error = fetchResult.error;

  var searchState = useState("");
  var search = searchState[0];
  var setSearch = searchState[1];

  var list = [];
  if (data && data.contracts) {
    list = data.contracts;
  } else if (data && Array.isArray(data)) {
    list = data;
  }

  var filtered = list.filter(function(c) {
    return c.title.toLowerCase().includes(search.toLowerCase());
  });

  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  function renderNewContractButton() {
    if (role !== "Client") return null;
    return (
      <Link
        to="/contracts/new"
        className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
      >
        + New Contract
      </Link>
    );
  }

  function renderError() {
    if (!error) return null;
    return (
      <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
        {error}
      </div>
    );
  }

  function renderCards() {
    return filtered.map(function(c) {
      var amount = c.amount ? c.amount.toLocaleString() : "0";
      var milestoneCount = c.milestones ? c.milestones.length : 0;
      var milestoneLabel = milestoneCount !== 1 ? "milestones" : "milestone";
      return (
        <Link
          key={c._id}
          to={"/contracts/" + c._id}
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
                {getCounterpartLabel(role) + ": "}
                <span className="text-gray-400">{getCounterpartName(c, role)}</span>
              </p>
            </div>
            <div className="ml-4 text-right shrink-0">
              <p className="text-white font-display font-bold text-lg">{"Rs." + amount}</p>
              <p className="text-muted text-xs mt-0.5">{milestoneCount + " " + milestoneLabel}</p>
            </div>
          </div>
        </Link>
      );
    });
  }

  function renderList() {
    if (loading) {
      return <div className="text-center text-muted text-sm py-16">Loading contracts...</div>;
    }
    if (filtered.length === 0) {
      var msg = search ? "No contracts match your search." : "No contracts yet.";
      return <div className="text-center text-muted text-sm py-16">{msg}</div>;
    }
    return <div className="space-y-3">{renderCards()}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">Contracts</h3>
          <p className="text-muted text-sm mt-0.5">{list.length + " total"}</p>
        </div>
        {renderNewContractButton()}
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search contracts..."
          className="w-full max-w-sm bg-card border border-line rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {renderError()}
      {renderList()}
    </div>
  );
}

import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function getStatusClass(status) {
  if (status === "open")        return "bg-red-500/10 text-red-400";
  if (status === "under_review") return "bg-yellow-400/10 text-yellow-400";
  if (status === "resolved")    return "bg-emerald-500/10 text-emerald-400";
  return "bg-white/10 text-gray-400";
}

function StatusPill(props) {
  var status = props.status;
  var cls = "text-xs px-2.5 py-1 rounded-full capitalize font-medium " + getStatusClass(status);
  return <span className={cls}>{status}</span>;
}

function DisputeCard(props) {
  const { showToast } = useToast();
  var dispute = props.dispute;
  var onRefetch = props.onRefetch;

  var evidenceState = useState("");
  var evidence = evidenceState[0];
  var setEvidence = evidenceState[1];

  var submittingState = useState(false);
  var submitting = submittingState[0];
  var setSubmitting = submittingState[1];

  var showFormState = useState(false);
  var showForm = showFormState[0];
  var setShowForm = showFormState[1];

  var milestoneTitle = dispute.milestone ? dispute.milestone.title : "-";
  var contractTitle = dispute.contract ? dispute.contract.title : "-";
  var raisedBy = dispute.raisedBy ? dispute.raisedBy.username : "-";
  var amount = dispute.milestone && dispute.milestone.amount
    ? dispute.milestone.amount.toLocaleString() : "0";

function handleSubmitEvidence() {
  if (!evidence.trim()) return;
  setSubmitting(true);
  api.post("/disputes/" + dispute._id + "/evidence", { evidence: evidence })
    .then(function() {
      setEvidence("");
      setShowForm(false);
      showToast("Evidence submitted successfully");
      onRefetch();
    })
    .catch(function(err) {
      const msg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message : "Failed to submit evidence";
      showToast(msg, "error");
    })
    .finally(function() { setSubmitting(false); });
}

  function renderEvidenceForm() {
    if (dispute.status === "resolved") return null;
    if (!showForm) {
      return (
        <button
          onClick={function() { setShowForm(true); }}
          className="text-xs text-brand-500 hover:text-brand-400 transition-colors mt-3"
        >
          + Submit evidence
        </button>
      );
    }
    return (
      <div className="mt-3 space-y-2">
        <textarea
          value={evidence}
          onChange={function(e) { setEvidence(e.target.value); }}
          rows={3}
          placeholder="Describe your evidence..."
          className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmitEvidence}
            disabled={submitting}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={function() { setShowForm(false); }}
            className="border border-line text-muted hover:text-white text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-line rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white text-sm font-medium">{milestoneTitle}</p>
            <StatusPill status={dispute.status} />
          </div>
          <p className="text-muted text-xs">{"Contract: " + contractTitle}</p>
          <p className="text-muted text-xs">{"Raised by: " + raisedBy}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white font-display font-bold">{"Rs." + amount}</p>
        </div>
      </div>
      {renderEvidenceForm()}
    </div>
  );
}

export default function DisputesPage() {
  var auth = useAuth();
  var user = auth.user;

  var fetchResult = useFetch("/disputes/my");
  var data = fetchResult.data;
  var loading = fetchResult.loading;
  var error = fetchResult.error;
  var refetch = fetchResult.refetch;

  var disputes = [];
  if (data && data.disputes) {
    disputes = data.disputes;
  }

  var open     = disputes.filter(function(d) { return d.status === "open"; }).length;
  var resolved = disputes.filter(function(d) { return d.status === "resolved"; }).length;

  function renderContent() {
    if (loading) {
      return <div className="text-center text-muted text-sm py-16">Loading disputes...</div>;
    }
    if (error) {
      return (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </div>
      );
    }
    if (disputes.length === 0) {
      return <div className="text-center text-muted text-sm py-16">No disputes yet.</div>;
    }
    return (
      <div className="space-y-3">
        {disputes.map(function(d) {
          return (
            <DisputeCard
              key={d._id}
              dispute={d}
              onRefetch={refetch}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-2xl font-bold text-white">Disputes</h3>
        <p className="text-muted text-sm mt-0.5">{disputes.length + " total"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-line rounded-2xl px-5 py-4">
          <p className="text-muted text-xs uppercase tracking-wider">Open</p>
          <p className="text-white font-display text-2xl font-bold mt-1">{open}</p>
        </div>
        <div className="bg-card border border-line rounded-2xl px-5 py-4">
          <p className="text-muted text-xs uppercase tracking-wider">Resolved</p>
          <p className="text-white font-display text-2xl font-bold mt-1">{resolved}</p>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
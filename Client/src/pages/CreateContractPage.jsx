import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

var emptyMilestone = { title: "", description: "", amount: "" };

function getStepCircleClass(current, s) {
  if (current >= s) return "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all bg-brand-500 text-white";
  return "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all bg-card border border-line text-muted";
}

function getStepLineClass(current, s) {
  if (current > s) return "h-px w-12 transition-all bg-brand-500";
  return "h-px w-12 transition-all bg-line";
}

function getTotalBannerClass(milestoneTotal, contractAmount) {
  if (milestoneTotal === contractAmount) {
    return "text-xs px-4 py-2.5 rounded-xl mb-4 border bg-brand-500/10 text-brand-500 border-brand-500/20";
  }
  return "text-xs px-4 py-2.5 rounded-xl mb-4 border bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
}

export default function CreateContractPage() {
  var navigate = useNavigate();

  var stepState = useState(1);
  var step = stepState[0];
  var setStep = stepState[1];

  var errorState = useState("");
  var error = errorState[0];
  var setError = errorState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var formState = useState({
    title:           "",
    description:     "",
    freelancerEmail: "",
    amount:          "",
  });
  var form = formState[0];
  var setForm = formState[1];

  var milestonesState = useState([Object.assign({}, emptyMilestone)]);
  var milestones = milestonesState[0];
  var setMilestones = milestonesState[1];

  function handleFormChange(e) {
    var name = e.target.name;
    var value = e.target.value;
    setForm(function(p) {
      var next = Object.assign({}, p);
      next[name] = value;
      return next;
    });
  }

  function handleMilestoneChange(i, e) {
    var name = e.target.name;
    var value = e.target.value;
    setMilestones(function(prev) {
      var updated = prev.map(function(m, idx) {
        if (idx !== i) return m;
        var next = Object.assign({}, m);
        next[name] = value;
        return next;
      });
      return updated;
    });
  }

  function addMilestone() {
    setMilestones(function(p) {
      return p.concat([Object.assign({}, emptyMilestone)]);
    });
  }

  function removeMilestone(i) {
    setMilestones(function(p) {
      return p.filter(function(_, idx) { return idx !== i; });
    });
  }

  var milestoneTotal = milestones.reduce(function(sum, m) {
    return sum + (parseFloat(m.amount) || 0);
  }, 0);

  var contractAmount = parseFloat(form.amount) || 0;

  function handleNext() {
    if (!form.title || !form.freelancerEmail || !form.amount) {
      setError("Please fill all fields");
      return;
    }
    setError("");
    setStep(2);
  }

  function handleSubmit() {
    setError("");
    setLoading(true);
    var payload = Object.assign({}, form, {
      amount: parseFloat(form.amount),
      milestones: milestones.map(function(m) {
        return Object.assign({}, m, { amount: parseFloat(m.amount) });
      }),
    });
    api.post("/contract", payload)
      .then(function(res) {
        var contractId = res.data.contract ? res.data.contract._id : res.data._id;
        navigate("/contracts/" + contractId);
      })
      .catch(function(err) {
        var msg = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to create contract";
        setError(msg);
        setStep(1);
      })
      .finally(function() {
        setLoading(false);
      });
  }

  function renderStepIndicator() {
    return (
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className={getStepCircleClass(step, 1)}>1</div>
          <div className={getStepLineClass(step, 1)} />
        </div>
        <div className="flex items-center gap-2">
          <div className={getStepCircleClass(step, 2)}>2</div>
        </div>
      </div>
    );
  }

  function renderStep1() {
    if (step !== 1) return null;
    return (
      <div className="bg-card border border-line rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Contract title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="e.g. Landing page redesign"
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            rows={3}
            placeholder="What's the scope of work?"
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Freelancer email</label>
          <input
            name="freelancerEmail"
            type="email"
            value={form.freelancerEmail}
            onChange={handleFormChange}
            placeholder="freelancer@example.com"
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Total amount (Rs.)</label>
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleFormChange}
            placeholder="50000"
            className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors text-sm mt-2"
        >
          Next — Add milestones →
        </button>
      </div>
    );
  }

  function renderMilestoneCard(m, i) {
    var showRemove = milestones.length > 1;
    return (
      <div key={i} className="bg-card border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white text-sm font-medium">{"Milestone " + (i + 1)}</p>
          {showRemove
            ? (
              <button
                onClick={function() { removeMilestone(i); }}
                className="text-muted hover:text-red-400 text-xs transition-colors"
              >
                Remove
              </button>
            )
            : null}
        </div>
        <div className="space-y-3">
          <input
            name="title"
            value={m.title}
            onChange={function(e) { handleMilestoneChange(i, e); }}
            placeholder="Milestone title"
            className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
          />
          <input
            name="description"
            value={m.description}
            onChange={function(e) { handleMilestoneChange(i, e); }}
            placeholder="What gets delivered?"
            className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
          />
          <input
            name="amount"
            type="number"
            value={m.amount}
            onChange={function(e) { handleMilestoneChange(i, e); }}
            placeholder="Amount (Rs.)"
            className="w-full bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>
    );
  }

  function renderStep2() {
    if (step !== 2) return null;
    var totalText = "Milestone total: Rs." + milestoneTotal.toLocaleString() + " / Rs." + contractAmount.toLocaleString() + " contract value";
    var mismatchText = milestoneTotal !== contractAmount ? " — amounts should match" : "";
    return (
      <div>
        <div className="space-y-3 mb-4">
          {milestones.map(function(m, i) {
            return renderMilestoneCard(m, i);
          })}
        </div>

        <div className={getTotalBannerClass(milestoneTotal, contractAmount)}>
          {totalText + mismatchText}
        </div>

        <button
          onClick={addMilestone}
          className="w-full border border-dashed border-line hover:border-brand-500/50 text-muted hover:text-brand-500 text-sm py-3 rounded-xl transition-all mb-4"
        >
          + Add milestone
        </button>

        <div className="flex gap-3">
          <button
            onClick={function() { setStep(1); }}
            className="flex-1 border border-line text-muted hover:text-white text-sm py-3 rounded-xl transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium text-sm py-3 rounded-xl transition-colors"
          >
            {loading ? "Creating..." : "Create contract"}
          </button>
        </div>
      </div>
    );
  }

  var stepLabel = step === 1 ? "Contract details" : "Milestone breakdown";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h3 className="font-display text-2xl font-bold text-white">New Contract</h3>
        <p className="text-muted text-sm mt-1">{"Step " + step + " of 2 — " + stepLabel}</p>
      </div>

      {renderStepIndicator()}

      {error
        ? (
          <div className="mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )
        : null}

      {renderStep1()}
      {renderStep2()}
    </div>
  );
}

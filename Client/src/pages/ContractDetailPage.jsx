import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import MilestoneActionButton from "../components/MilestoneActionButton";
import api from "../api/axios";

function getStatusClass(status) {
  if (status === "pending") return "bg-gray-500/10 text-gray-400";
  if (status === "funded") return "bg-blue-500/10 text-blue-400";
  if (status === "submitted") return "bg-yellow-400/10 text-yellow-400";
  if (status === "approved") return "bg-brand-500/10 text-brand-500";
  if (status === "disputed") return "bg-red-500/10 text-red-400";
  if (status === "released") return "bg-emerald-500/10 text-emerald-400";
  return "bg-white/10 text-gray-400";
}

function StatusPill(props) {
  var status = props.status;
  var cls = "text-xs px-2 py-0.5 rounded-full capitalize font-medium " + getStatusClass(status);
  return (
    <span className={cls}>{status}</span>
  );
}

function FileLinkOrNull(props) {
  var fileUrl = props.fileUrl;
  if (!fileUrl) return null;
  var href = fileUrl.startsWith("http://") || fileUrl.startsWith("https://")
    ? fileUrl
    : "https://" + fileUrl;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-block mt-2 text-xs text-brand-500 hover:text-brand-400 transition-colors"
    >
      View submitted file
    </a>
  );
}

function MilestoneCard(props) {
  const milestone = props.milestone;
  const role = props.role;
  const onAction = props.onAction;

  const status = milestone.status;
  const title = milestone.title;
  const description = milestone.description;
  const fileUrl = milestone.deliverableUrl;
  const amount = milestone.amount;
  const milestoneId = milestone._id;
  const amountText = amount ? amount.toLocaleString() : "0";

  const actions = [];
  if (role === "Client") {
    if (status === "pending")   actions.push("fund");
    if (status === "submitted") { actions.push("approve"); actions.push("dispute"); }
    if (status === "disputed")  actions.push("release");
  }
  if (role === "Freelancer") {
    if (status === "funded") actions.push("submit");
  }

function handleInvoiceDownload() {
  api.get("/milestone/" + milestoneId + "/invoice", { responseType: "blob" })
    .then(function(res) {
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "invoice-" + milestoneId + ".pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(function(err) {
      alert("Failed to download invoice");
    });
}

  function renderInvoiceButton() {
    if (status !== "released") return null;
    return (
      <button
        onClick={handleInvoiceDownload}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-500/20"
      >
        Download Invoice
      </button>
    );
  }

function renderFileLink() {
  if (!fileUrl) return null;
  var href = fileUrl.startsWith("http://") || fileUrl.startsWith("https://")
    ? fileUrl
    : "https://" + fileUrl;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-block mt-2 text-xs text-brand-500 hover:text-brand-400 transition-colors"
    >
      View submitted file
    </a>
  );
}

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white text-sm font-medium">{title}</p>
            <StatusPill status={status} />
          </div>
          <p className="text-muted text-xs leading-relaxed">{description}</p>
          {renderFileLink()}
        </div>
        <div className="text-right shrink-0">
          <p className="text-white font-display font-bold">{"Rs." + amountText}</p>
          <div className="flex gap-2 mt-2 justify-end flex-wrap">
            {actions.map(function(action) {
              return (
                <MilestoneActionButton
                  key={action}
                  action={action}
                  milestoneId={milestoneId}
                  onSuccess={onAction}
                />
              );
            })}
            {renderInvoiceButton()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractDetailPage() {
  var params = useParams();
  var id = params.id;

  var auth = useAuth();
  var user = auth.user;

  var fetchResult = useFetch("/contract/" + id);
  var data = fetchResult.data;
  var loading = fetchResult.loading;
  var error = fetchResult.error;
  var refetch = fetchResult.refetch;

  var contract = null;
  if (data) {
    contract = data.contract ? data.contract : data;
  }

  var milestones = [];
  if (data && data.milestones) {
    milestones = data.milestones;
  } else if (contract && contract.milestones) {
    milestones = contract.milestones;
  }

  var released = 0;
  for (var i = 0; i < milestones.length; i++) {
    if (milestones[i].status === "released") released++;
  }

  var progress = milestones.length
    ? Math.round((released / milestones.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
        {error}
      </div>
    );
  }

  if (!contract) return null;

  var contractTitle = contract.title;
  var contractDesc = contract.description;
  var contractStatus = contract.status ? contract.status : "pending";
  var contractAmount = contract.amount ? contract.amount.toLocaleString() : "0";
  var clientName = contract.client ? (contract.client.username || contract.client.name || "-") : "-";
  var freelancerName = contract.freelancer ? (contract.freelancer.username || contract.freelancer.name || "-") : "-";
  var statusCls = "text-xs px-2.5 py-1 rounded-full capitalize font-medium mt-1 inline-block " + getStatusClass(contractStatus);
  var role = user ? user.role : "";
  var milestoneCount = milestones.length;
  var progressWidth = progress + "%";

  return (
    <div className="max-w-3xl mx-auto">

      <div className="bg-card border border-line rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-white">{contractTitle}</h3>
            <p className="text-muted text-sm mt-1">{contractDesc}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-2xl font-bold text-white">{"Rs." + contractAmount}</p>
            <span className={statusCls}>{contractStatus}</span>
          </div>
        </div>
        <div className="flex gap-6 pt-4 border-t border-line text-sm">
          <div>
            <p className="text-muted text-xs mb-0.5">Client</p>
            <p className="text-white">{clientName}</p>
          </div>
          <div>
            <p className="text-muted text-xs mb-0.5">Freelancer</p>
            <p className="text-white">{freelancerName}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-line rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-white font-medium">Progress</p>
          <p className="text-sm text-muted">{released + "/" + milestoneCount + " milestones released"}</p>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: progressWidth }}
          />
        </div>
        <p className="text-right text-xs text-muted mt-1">{progress + "%"}</p>
      </div>

      <div>
        <h4 className="text-white font-medium text-sm mb-3">{"Milestones (" + milestoneCount + ")"}</h4>
        <div className="space-y-3">
          {milestones.map(function (m) {
            return (
              <MilestoneCard
                key={m._id}
                milestone={m}
                role={role}
                onAction={refetch}
              />
            );
          })}
        </div>
      </div>

    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Applicant } from "@/lib/types";
import { formatDate } from "@/lib/formatters";
import { StatusPill } from "../ui/StatusPill";

interface ApplicantManagerProps {
  applicants: Applicant[];
  onAddApplicant: (payload: { name: string; role: string; region: string }) => Promise<void> | void;
  onRemoveApplicant: (applicant: Applicant) => Promise<void> | void;
  onPauseApplicant?: (applicant: Applicant) => void;
  pausedApplicantIds?: Set<string>;
  onNotify?: (message: string) => void;
}

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
  new: "default",
  in_progress: "warning",
  verified: "success",
  flagged: "danger"
};

export function ApplicantManager({
  applicants,
  onAddApplicant,
  onRemoveApplicant,
  onPauseApplicant,
  pausedApplicantIds,
  onNotify
}: ApplicantManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState({ name: "", role: "", region: "" });

  const stats = useMemo(() => {
    const verified = applicants.filter((applicant) => applicant.status === "verified").length;
    const flagged = applicants.filter((applicant) => applicant.status === "flagged").length;
    return { total: applicants.length, verified, flagged };
  }, [applicants]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.role.trim() || !formState.region.trim()) {
      return;
    }

    await onAddApplicant({ ...formState });
    setFormState({ name: "", role: "", region: "" });
    setIsAdding(false);
  };

  return (
    <div className="card applicant-manager">
      <div className="applicant-manager-header">
        <h2>Applicant runway</h2>
        <button type="button" className="primary" onClick={() => setIsAdding((prev) => !prev)}>
          {isAdding ? "Close" : "Add applicant"}
        </button>
      </div>

      <div className="applicant-manager-stats">
        <div>
          <div className="metric-value">{stats.total}</div>
          <div className="metric-label">in pipeline</div>
        </div>
        <div>
          <div className="metric-value" style={{ color: "var(--success)" }}>{stats.verified}</div>
          <div className="metric-label">verified</div>
        </div>
        <div>
          <div className="metric-value" style={{ color: "var(--danger)" }}>{stats.flagged}</div>
          <div className="metric-label">flagged</div>
        </div>
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="applicant-manager-form">
          <div className="applicant-manager-form-grid">
            <input
              required
              placeholder="Full name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              required
              placeholder="Role"
              value={formState.role}
              onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
            />
            <input
              required
              placeholder="Region"
              value={formState.region}
              onChange={(event) => setFormState((prev) => ({ ...prev, region: event.target.value }))}
            />
          </div>
          <div className="applicant-manager-form-actions">
            <button type="button" className="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Save
            </button>
          </div>
        </form>
      ) : null}

      <div className="applicant-runway-table">
        <table className="runway-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Search ID</th>
              <th>Requestor</th>
              <th>Package Name</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Progress & ETA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => {
              const isPaused = pausedApplicantIds?.has(applicant.id) ?? false;
              const progress = applicant.status === "verified" ? "100%" :
                              applicant.status === "in_progress" ? "50%" :
                              applicant.status === "flagged" ? "ETA Unavailable" : "0%";

              return (
                <tr key={applicant.id} className={isPaused ? "paused-row" : ""}>
                  <td className="name-cell">
                    <strong>{applicant.name}</strong>
                  </td>
                  <td className="id-cell">{applicant.id}</td>
                  <td className="requestor-cell">api_SMKYBER3 null</td>
                  <td className="package-cell">{applicant.role}</td>
                  <td className="date-cell">{formatDate(applicant.submittedAt)}</td>
                  <td className="status-cell">
                    <div className="status-stack">
                      <StatusPill tone={STATUS_TONE[applicant.status]}>
                        {applicant.status === "verified" ? "Completed" :
                         applicant.status === "in_progress" ? "Pending" :
                         applicant.status === "flagged" ? "Info Needed" : "New"}
                      </StatusPill>
                      {isPaused ? <StatusPill tone="warning">paused</StatusPill> : null}
                    </div>
                  </td>
                  <td className="progress-cell">{progress}</td>
                  <td className="actions-cell">
                    <div className="applicant-actions">
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => {
                          if (!onPauseApplicant) {
                            return;
                          }
                          onPauseApplicant(applicant);
                          onNotify?.(isPaused ? `${applicant.name} resumed` : `${applicant.name} paused`);
                        }}
                      >
                        {isPaused ? "Resume" : "Pause"}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={async () => {
                          const confirmation = window
                            .prompt(`Type "delete the order" to remove ${applicant.name} from the pipeline.`)
                            ?.trim()
                            .toLowerCase();
                          if (confirmation !== "delete the order") {
                            onNotify?.("Removal cancelled");
                            return;
                          }
                          await onRemoveApplicant(applicant);
                          onNotify?.(`${applicant.name} removed from pipeline`);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

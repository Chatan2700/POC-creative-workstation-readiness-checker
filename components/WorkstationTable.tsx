import Link from "next/link";
import type { StoredWorkstationReport } from "@/types/report";

type WorkstationTableProps = {
  reports: StoredWorkstationReport[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date(value));
}

function scoreClass(score: number) {
  return score >= 75
    ? "text-[var(--text-primary)]"
    : score >= 55
      ? "text-[var(--text-primary)]"
      : "text-[var(--text-secondary)]";
}

function ScoreDots({ score }: { score: number }) {
  const activeDots = Math.round(score / 7);

  return (
    <div className="mt-2 flex gap-1" aria-hidden="true">
      {Array.from({ length: 14 }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 w-1.5 rounded-full ${
            index < activeDots ? "bg-white/75" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

function statusDotClass(score: number) {
  if (score >= 75) {
    return "bg-[var(--ready)]";
  }
  if (score >= 55) {
    return "bg-[var(--attention)]";
  }
  return "bg-[var(--blocked)]";
}

export function WorkstationTable({ reports }: WorkstationTableProps) {
  return (
    <section className="paper-card p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="caption">Fleet inventory</p>
          <h2 className="mt-4 text-xl font-medium text-[var(--text-primary)]">
            Workstation readiness inventory
          </h2>
        </div>
        <p className="rounded-[20px] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)]">
          {reports.length} reports
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            <tr className="border-b border-[var(--border)]">
              <th className="py-4 pr-6 font-medium">Workstation</th>
              <th className="py-4 pr-6 font-medium">Score</th>
              <th className="py-4 pr-6 font-medium">Status</th>
              <th className="py-4 pr-6 font-medium">Missing</th>
              <th className="py-4 pr-6 font-medium">Last checked</th>
              <th className="py-4 font-medium">Report</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-[var(--border)] last:border-0"
              >
                <td className="py-6 pr-6">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">
                      {report.hostname}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {report.os}
                    </p>
                  </div>
                </td>
                <td className="py-6 pr-6">
                  <p
                    className={`text-2xl font-light leading-none ${scoreClass(report.readinessScore)}`}
                  >
                    {report.readinessScore}
                  </p>
                  <ScoreDots score={report.readinessScore} />
                </td>
                <td className="py-6 pr-6 text-[var(--text-primary)]">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${statusDotClass(report.readinessScore)}`}
                    />
                    <span>{report.status}</span>
                  </div>
                </td>
                <td className="py-6 pr-6 text-[var(--text-secondary)]">
                  {report.missingTools.length}
                </td>
                <td className="py-6 pr-6 text-[var(--text-secondary)]">
                  {formatDate(report.lastChecked)} UTC
                </td>
                <td className="py-6">
                  <Link
                    href={`/workstations/${report.id}`}
                    className="border-b border-dotted border-white/40 text-sm font-medium text-[var(--text-primary)] transition duration-200 hover:text-[var(--accent)]"
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import type { WorkstationReport } from "@/types/report";

type ScoreCardProps = {
  report: WorkstationReport;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function ScoreCard({ report }: ScoreCardProps) {
  return (
    <aside className="paper-card relative flex flex-col justify-between overflow-hidden p-8">
      <div className="halftone pointer-events-none absolute -right-16 -top-12 h-56 w-56" />
      <div>
        <p className="caption">Readiness score</p>
        <div className="mt-8 flex items-end gap-3">
          <span className="text-8xl font-light leading-none text-[var(--text-primary)]">
            {report.readinessScore}
          </span>
          <span className="pb-3 text-2xl font-light text-[var(--text-secondary)]">
            /100
          </span>
        </div>
        <div className="mt-8 h-px overflow-hidden bg-white/[0.06]">
          <div
            className="h-full bg-white/75"
            style={{ width: `${report.readinessScore}%` }}
          />
        </div>
        <p className="mt-8 text-base font-medium text-[var(--text-primary)]">
          {report.status}
        </p>
      </div>

      <dl className="relative mt-16 grid gap-6 border-t border-[var(--border)] pt-8">
        <div>
          <dt className="text-xs text-[var(--text-secondary)]">Hostname</dt>
          <dd className="mt-2 text-lg font-medium text-[var(--text-primary)]">
            {report.hostname}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--text-secondary)]">Last checked</dt>
          <dd className="mt-2 text-lg font-medium text-[var(--text-primary)]">
            {formatDate(report.lastChecked)} UTC
          </dd>
        </div>
      </dl>
    </aside>
  );
}

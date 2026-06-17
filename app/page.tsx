import { AppShell } from "@/components/AppShell";
import { CommonGaps, FleetOverview } from "@/components/FleetOverview";
import { WorkstationTable } from "@/components/WorkstationTable";
import { getFleetSummary, getReports } from "@/lib/report";

const workflowSteps = [
  "Python diagnostics",
  "JSON report",
  "GitHub",
  "Next.js dashboard"
];

function ReadinessDots({ score }: { score: number }) {
  const activeDots = Math.round(score / 5);

  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: 20 }, (_, index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-full ${
            index < activeDots ? "bg-white/75" : "border border-white/20"
          }`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const reports = getReports();
  const summary = getFleetSummary(reports);

  return (
    <AppShell>
      <div className="mx-auto grid max-w-[1280px] gap-6">
        <section className="relative grid gap-10 overflow-hidden py-8 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="halftone pointer-events-none absolute -left-20 -top-28 h-96 w-96" />
          <div className="relative">
            <p className="caption">Creative IT readiness</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[1.02] tracking-normal text-[var(--text-primary)] sm:text-6xl">
              Workstation fleet readiness.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              Unique local reports stand in for future cloud storage. The
              dashboard behaves like a fleet view: collect, list, inspect,
              and compare workstation readiness.
            </p>
          </div>

          <div className="relative border-l border-[var(--border)] pl-10">
            <p className="caption">Fleet readiness</p>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-6xl font-light leading-none text-[var(--text-primary)]">
                {summary.averageReadinessScore}
              </span>
              <span className="pb-2 text-2xl font-light text-[var(--text-secondary)]">
                /100
              </span>
            </div>
            <div className="mt-6">
              <ReadinessDots score={summary.averageReadinessScore} />
            </div>
            <p className="mt-7 text-sm leading-6 text-[var(--text-secondary)]">
              Average readiness score across {summary.totalWorkstations}{" "}
              workstations
            </p>
          </div>
        </section>

        <FleetOverview summary={summary} />

        <WorkstationTable reports={reports} />

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="paper-card relative overflow-hidden p-8">
            <div className="halftone pointer-events-none absolute -right-12 -top-12 h-56 w-56" />
            <p className="caption">Report pipeline</p>
            <div className="relative mt-8 grid gap-6">
              {workflowSteps.map((step, index) => (
                <div key={step} className="grid grid-cols-[32px_1fr] gap-5">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {step}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Step {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <CommonGaps summary={summary} />
        </section>
      </div>
    </AppShell>
  );
}

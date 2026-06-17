import type { FleetSummary } from "@/types/report";

type FleetOverviewProps = {
  summary: FleetSummary;
};

export function FleetOverview({ summary }: FleetOverviewProps) {
  const cards = [
    {
      label: "Workstations",
      value: summary.totalWorkstations,
      detail: "Reports available"
    },
    {
      label: "Ready",
      value: summary.readyCount,
      detail: "Ready or minor"
    },
    {
      label: "Needs attention",
      value: summary.needsAttentionCount,
      detail: "Review before handoff"
    },
    {
      label: "Not ready",
      value: summary.notReadyCount,
      detail: "Blocked for creative use"
    }
  ];

  return (
    <section className="paper-card grid h-full gap-0 p-0 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="border-b border-[var(--border)] p-8 sm:even:border-l xl:border-b-0 xl:border-l xl:first:border-l-0"
        >
          <p className="caption">{card.label}</p>
          <p className="mt-5 text-5xl font-light leading-none text-[var(--text-primary)]">
            {card.value}
          </p>
          <div className="mt-5 flex items-center gap-3 text-sm leading-6 text-[var(--text-secondary)]">
            <span className="h-2 w-2 rounded-full bg-white/45" />
            <span>{card.detail}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export function CommonGaps({ summary }: FleetOverviewProps) {
  const topMissingTools = Object.entries(summary.missingToolCounts)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 4);

  return (
    <article className="paper-card relative h-full min-h-[146px] overflow-hidden p-8">
      <div className="halftone pointer-events-none absolute -bottom-20 -right-16 h-72 w-72" />
      <p className="caption">Common gaps</p>
      <div className="relative mt-7 grid gap-0">
        {topMissingTools.length ? (
          topMissingTools.map(([tool, count]) => (
            <div
              key={tool}
              className="flex items-center justify-between border-b border-[var(--border)] py-5 first:pt-0 last:border-0 last:pb-0"
            >
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {tool}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                {count} missing
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            No missing tools across the current report set.
          </p>
        )}
      </div>
    </article>
  );
}

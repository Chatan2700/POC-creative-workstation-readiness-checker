import type { WorkstationReport } from "@/types/report";

type WorkstationSummaryProps = {
  report: WorkstationReport;
};

const labelClass = "caption";
const valueClass = "mt-5 text-2xl font-light text-[var(--text-primary)]";

export function WorkstationSummary({ report }: WorkstationSummaryProps) {
  const diskFreePercent = report.diskTotalGb
    ? Math.round((report.diskFreeGb / report.diskTotalGb) * 100)
    : 0;

  const cards = [
    { label: "Operating system", value: report.os },
    { label: "CPU", value: report.cpu },
    { label: "RAM", value: `${report.ramGb} GB` },
    {
      label: "Disk",
      value: `${report.diskFreeGb} GB free`,
      detail: `${report.diskTotalGb} GB total, ${diskFreePercent}% available`
    },
    { label: "Network", value: report.networkStatus }
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className="paper-card min-h-40 p-8"
        >
          <p className={labelClass}>{card.label}</p>
          <p className={valueClass}>{card.value}</p>
          {card.detail ? (
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              {card.detail}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

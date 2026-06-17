import crypto from "node:crypto";
import Link from "next/link";
import type { StoredWorkstationReport } from "@/types/report";

const criticalTools = [
  "Adobe Photoshop",
  "Adobe Premiere Pro",
  "Adobe After Effects",
  "Figma",
  "Blender",
  "Cinema 4D"
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  }).format(new Date(value));
}

function diskFreePercent(report: StoredWorkstationReport) {
  return report.diskTotalGb
    ? Math.round((report.diskFreeGb / report.diskTotalGb) * 100)
    : 0;
}

function deviceId(report: StoredWorkstationReport) {
  return report.hostname.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function fingerprint(report: StoredWorkstationReport) {
  return crypto
    .createHash("sha256")
    .update(`${report.hostname}:${report.os}:${report.cpu}`)
    .digest("hex")
    .slice(0, 16);
}

function statusClass(report: StoredWorkstationReport) {
  if (report.readinessScore >= 75) {
    return "border-[var(--ready)]/40 text-[var(--ready)]";
  }
  if (report.readinessScore >= 55) {
    return "border-[var(--attention)]/40 text-[var(--attention)]";
  }
  return "border-[var(--blocked)]/40 text-[var(--blocked)]";
}

function scoreBreakdown(report: StoredWorkstationReport) {
  const diskPercent = diskFreePercent(report);
  const toolPoints = Math.round(
    (report.installedTools.length / criticalTools.length) * 40
  );

  return [
    { label: "Workstation identified", value: "+20" },
    {
      label: report.ramGb >= 32 ? "RAM requirement met" : "RAM below baseline",
      value: report.ramGb >= 64 ? "+25" : report.ramGb >= 32 ? "+22" : report.ramGb >= 16 ? "+14" : "+0"
    },
    {
      label: diskPercent >= 20 ? "Disk space healthy" : "Disk space constrained",
      value: diskPercent >= 25 ? "+20" : diskPercent >= 20 ? "+16" : diskPercent >= 10 ? "+8" : "+0"
    },
    {
      label:
        report.networkStatus === "Connected"
          ? "Network connected"
          : "Network disconnected",
      value: report.networkStatus === "Connected" ? "+15" : "+0"
    },
    {
      label: "Required creative tools installed",
      value: `+${toolPoints}`
    },
    {
      label: "Missing critical creative tools",
      value: report.missingTools.some((tool) => criticalTools.includes(tool))
        ? "Risk"
        : "Clear"
    }
  ];
}

function recommendationPriority(recommendation: string) {
  const text = recommendation.toLowerCase();

  if (
    text.includes("internet") ||
    text.includes("connectivity") ||
    text.includes("disk space") ||
    text.includes("photoshop") ||
    text.includes("premiere") ||
    text.includes("after effects")
  ) {
    return "High";
  }

  if (text.includes("blender") || text.includes("cinema 4d") || text.includes("memory")) {
    return "Medium";
  }

  return "Low";
}

function recommendationReason(recommendation: string) {
  const text = recommendation.toLowerCase();

  if (text.includes("connectivity") || text.includes("internet")) {
    return "Blocks activation, license checks, cloud sync, and collaborative tools.";
  }
  if (text.includes("disk space")) {
    return "Media-heavy creative workflows need local cache and scratch space.";
  }
  if (text.includes("photoshop") || text.includes("premiere") || text.includes("after effects")) {
    return "Core Adobe applications are expected for common creative team workflows.";
  }
  if (text.includes("blender") || text.includes("cinema 4d")) {
    return "3D and motion design workflows may depend on this workstation role.";
  }
  if (text.includes("memory")) {
    return "Creative applications benefit from at least 32 GB of RAM.";
  }
  if (text.includes("license")) {
    return "Prevents handoff delays after the workstation reaches the user.";
  }
  return "Supports a cleaner handoff for creative production use.";
}

function priorityClass(priority: string) {
  if (priority === "High") {
    return "border-[var(--blocked)]/40 text-[var(--blocked)]";
  }
  if (priority === "Medium") {
    return "border-[var(--attention)]/40 text-[var(--attention)]";
  }
  return "border-white/20 text-[var(--text-secondary)]";
}

export function DetailBackLink() {
  return (
    <Link
      href="/"
      className="w-fit text-sm font-medium text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
    >
      Back to fleet dashboard
    </Link>
  );
}

export function ReportHeader({ report }: { report: StoredWorkstationReport }) {
  const metadata = [
    ["Device ID", deviceId(report)],
    ["Report ID", report.id],
    ["Last checked", `${formatDate(report.lastChecked)} UTC`],
    ["Source file", report.filename]
  ];

  return (
    <section className="paper-card p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="caption">Workstation report</p>
          <h1 className="mt-5 text-4xl font-medium leading-tight text-[var(--text-primary)] sm:text-5xl">
            {report.hostname}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            This report summarizes workstation health, creative software
            readiness, and IT support recommendations generated from a local
            diagnostics script.
          </p>
        </div>
        <span
          className={`w-fit rounded-[20px] border px-4 py-2 text-sm font-medium ${statusClass(report)}`}
        >
          {report.status}
        </span>
      </div>

      <dl className="mt-8 grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-4">
        {metadata.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-[var(--text-secondary)]">{label}</dt>
            <dd className="mt-2 break-all text-sm font-medium text-[var(--text-primary)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ReadinessScorePanel({
  report
}: {
  report: StoredWorkstationReport;
}) {
  return (
    <section className="paper-card p-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="caption">Readiness score</p>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-7xl font-light leading-none text-[var(--text-primary)]">
              {report.readinessScore}
            </span>
            <span className="pb-2 text-2xl font-light text-[var(--text-secondary)]">
              /100
            </span>
          </div>
          <p className="mt-5 text-sm font-medium text-[var(--text-primary)]">
            {report.status}
          </p>
        </div>

        <div>
          <p className="caption">Score breakdown</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {scoreBreakdown(report).map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-[var(--border)] pb-3"
              >
                <span className="text-sm text-[var(--text-secondary)]">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SystemHealthGrid({ report }: { report: StoredWorkstationReport }) {
  const diskPercent = diskFreePercent(report);
  const cards = [
    {
      label: "Operating System",
      value: report.os,
      status: "Detected",
      detail: "Reported by local diagnostics"
    },
    {
      label: "CPU",
      value: report.cpu,
      status: report.cpu === "Unknown CPU" ? "Needs verification" : "Detected",
      detail: "Processor string from the operating system"
    },
    {
      label: "RAM",
      value: `${report.ramGb} GB`,
      status:
        report.ramGb >= 32 ? "Meets creative baseline" : "Below creative baseline",
      detail: "32 GB recommended for creative workloads"
    },
    {
      label: "Disk",
      value: `${report.diskFreeGb} GB free`,
      status: diskPercent >= 20 ? "Healthy" : "Needs cleanup",
      detail: `${diskPercent}% available`
    },
    {
      label: "Network",
      value: report.networkStatus,
      status:
        report.networkStatus === "Connected"
          ? "Ready for license checks"
          : "Blocks license checks/cloud sync",
      detail: "Connectivity test from diagnostics"
    }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article className="paper-card p-5" key={card.label}>
          <p className="caption">{card.label}</p>
          <p className="mt-4 text-xl font-medium text-[var(--text-primary)]">
            {card.value}
          </p>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {card.status}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
            {card.detail}
          </p>
        </article>
      ))}
    </section>
  );
}

export function CreativeToolsPanel({
  report
}: {
  report: StoredWorkstationReport;
}) {
  return (
    <section className="paper-card p-8">
      <p className="caption">Creative tools</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-base font-medium text-[var(--text-primary)]">
            Installed tools
          </h2>
          <ul className="mt-4 grid gap-3">
            {report.installedTools.length ? (
              report.installedTools.map((tool) => (
                <li
                  className="rounded-[20px] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-primary)]"
                  key={tool}
                >
                  {tool}
                </li>
              ))
            ) : (
              <li className="text-sm text-[var(--text-secondary)]">
                No creative tools detected.
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-medium text-[var(--text-primary)]">
            Missing tools
          </h2>
          <ul className="mt-4 grid gap-3">
            {report.missingTools.length ? (
              report.missingTools.map((tool) => (
                <li
                  className="flex items-center justify-between rounded-[20px] border border-[var(--border)] px-4 py-3 text-sm"
                  key={tool}
                >
                  <span className="text-[var(--text-primary)]">{tool}</span>
                  {criticalTools.includes(tool) ? (
                    <span className="text-xs text-[var(--attention)]">
                      important
                    </span>
                  ) : null}
                </li>
              ))
            ) : (
              <li className="text-sm text-[var(--text-secondary)]">
                All tracked creative tools are installed.
              </li>
            )}
          </ul>
        </div>
      </div>
      <p className="mt-6 border-t border-[var(--border)] pt-5 text-xs leading-6 text-[var(--text-secondary)]">
        Creative tool detection is based on local diagnostics and can be
        expanded for MDM or software inventory integrations.
      </p>
    </section>
  );
}

export function RecommendationsPanel({
  report
}: {
  report: StoredWorkstationReport;
}) {
  return (
    <section className="paper-card p-8">
      <p className="caption">Recommendations</p>
      <h2 className="mt-4 text-base font-medium text-[var(--text-primary)]">
        IT action items
      </h2>
      <div className="mt-6 grid gap-4">
        {report.recommendations.map((recommendation) => {
          const priority = recommendationPriority(recommendation);

          return (
            <article
              className="grid gap-4 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0 md:grid-cols-[110px_1fr]"
              key={recommendation}
            >
              <span
                className={`h-fit w-fit rounded-[20px] border px-3 py-1 text-xs font-medium ${priorityClass(priority)}`}
              >
                {priority}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {recommendation}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  {recommendationReason(recommendation)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function DeviceIdentityPanel({
  report
}: {
  report: StoredWorkstationReport;
}) {
  const rows = [
    ["Device ID", deviceId(report)],
    ["Hostname", report.hostname],
    ["Serial number", "Masked / unavailable"],
    ["Machine fingerprint", fingerprint(report)],
    ["Operating system", report.os],
    ["Report ID", report.id]
  ];

  return (
    <section className="paper-card p-8">
      <p className="caption">Device identity</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([label, value]) => (
          <div className="border-t border-[var(--border)] pt-4" key={label}>
            <p className="text-xs text-[var(--text-secondary)]">{label}</p>
            <p className="mt-2 break-all text-sm font-medium text-[var(--text-primary)]">
              {value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs leading-6 text-[var(--text-secondary)]">
        Device identity uses a hashed fingerprint so reports can be tied to a
        workstation without exposing full hardware serial numbers.
      </p>
    </section>
  );
}

export function DiagnosticPipeline() {
  const steps = [
    "Python diagnostics",
    "JSON report",
    "GitHub storage",
    "Next.js dashboard"
  ];

  return (
    <section className="paper-card p-8">
      <p className="caption">Diagnostic pipeline</p>
      <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--text-primary)] md:flex-row md:items-center">
        {steps.map((step, index) => (
          <div className="flex items-center gap-3" key={step}>
            <span>{step}</span>
            {index < steps.length - 1 ? (
              <span className="text-[var(--text-secondary)]">-&gt;</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function RawReportPreview({ report }: { report: StoredWorkstationReport }) {
  return (
    <details className="paper-card p-8">
      <summary className="cursor-pointer text-sm font-medium text-[var(--text-primary)]">
        Raw JSON report
      </summary>
      <pre className="mt-6 max-h-96 overflow-auto rounded-[20px] border border-[var(--border)] bg-black/20 p-5 text-xs leading-6 text-[var(--text-secondary)]">
        {JSON.stringify(report, null, 2)}
      </pre>
    </details>
  );
}

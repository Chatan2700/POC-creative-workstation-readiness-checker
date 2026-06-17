type CreativeToolsProps = {
  installedTools: string[];
  missingTools: string[];
};

function ToolPill({ label, variant }: { label: string; variant: "installed" | "missing" }) {
  const classes =
    variant === "installed"
      ? "border-[var(--border)] text-[var(--text-primary)]"
      : "border-[var(--border)] text-[var(--text-secondary)]";

  return (
    <li className={`rounded-[20px] border px-5 py-4 text-sm font-medium ${classes}`}>
      {label}
    </li>
  );
}

export function CreativeTools({
  installedTools,
  missingTools
}: CreativeToolsProps) {
  return (
    <section className="paper-card p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="caption">Creative tools</p>
          <h2 className="mt-3 text-base font-medium text-[var(--text-primary)]">
            Installed and missing applications
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {installedTools.length} installed, {missingTools.length} missing
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Installed</h3>
          <ul className="mt-3 grid gap-3">
            {installedTools.length ? (
              installedTools.map((tool) => (
                <ToolPill key={tool} label={tool} variant="installed" />
              ))
            ) : (
              <li className="rounded-[20px] border border-[var(--border)] px-5 py-4 text-sm text-[var(--text-secondary)]">
                No creative tools detected.
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Missing</h3>
          <ul className="mt-3 grid gap-3">
            {missingTools.length ? (
              missingTools.map((tool) => (
                <ToolPill key={tool} label={tool} variant="missing" />
              ))
            ) : (
              <li className="rounded-[20px] border border-[var(--border)] px-5 py-4 text-sm text-[var(--text-primary)]">
                All tracked creative tools are installed.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

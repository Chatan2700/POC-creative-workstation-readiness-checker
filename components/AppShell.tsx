import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
        <div className="halftone pointer-events-none absolute right-4 top-0 h-72 w-72 lg:h-[420px] lg:w-[420px]" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}

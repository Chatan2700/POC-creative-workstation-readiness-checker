import fs from "node:fs";
import path from "node:path";
import type {
  FleetSummary,
  StoredWorkstationReport,
  WorkstationReport
} from "@/types/report";

const reportsDirectory = path.join(process.cwd(), "data", "reports");
const fallbackReportPath = path.join(process.cwd(), "data", "report.json");

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function idFromReport(report: WorkstationReport, filename: string) {
  if (report.id) {
    return report.id;
  }

  const timestamp = report.lastChecked.replace(/[^0-9a-z]/gi, "");
  return `${slugify(report.hostname)}-${timestamp || filename.replace(".json", "")}`;
}

function readReportFile(filePath: string): StoredWorkstationReport {
  const raw = fs.readFileSync(filePath, "utf8");
  const report = JSON.parse(raw) as WorkstationReport;
  const filename = path.basename(filePath);

  return {
    ...report,
    id: idFromReport(report, filename),
    filename
  };
}

export function getReports(): StoredWorkstationReport[] {
  const reportFiles = fs.existsSync(reportsDirectory)
    ? fs
        .readdirSync(reportsDirectory)
        .filter((filename) => filename.endsWith(".json"))
        .map((filename) => path.join(reportsDirectory, filename))
    : [];

  const reports = reportFiles.length
    ? reportFiles.map(readReportFile)
    : fs.existsSync(fallbackReportPath)
      ? [readReportFile(fallbackReportPath)]
      : [];

  return reports.sort(
    (a, b) =>
      new Date(b.lastChecked).getTime() - new Date(a.lastChecked).getTime()
  );
}

export function getReport(id: string): StoredWorkstationReport | undefined {
  return getReports().find((report) => report.id === id);
}

export function getFleetSummary(
  reports: StoredWorkstationReport[]
): FleetSummary {
  const totalWorkstations = reports.length;
  const averageReadinessScore = totalWorkstations
    ? Math.round(
        reports.reduce((total, report) => total + report.readinessScore, 0) /
          totalWorkstations
      )
    : 0;

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const missingToolCounts: Record<string, number> = {};

  for (const report of reports) {
    for (const tool of report.missingTools) {
      missingToolCounts[tool] = (missingToolCounts[tool] ?? 0) + 1;
    }
  }

  return {
    totalWorkstations,
    averageReadinessScore,
    readyCount: reports.filter((report) => report.readinessScore >= 75).length,
    needsAttentionCount: reports.filter(
      (report) =>
        report.readinessScore >= 55 && report.readinessScore < 75
    ).length,
    notReadyCount: reports.filter((report) => report.readinessScore < 55).length,
    staleCount: reports.filter(
      (report) => now - new Date(report.lastChecked).getTime() > sevenDaysMs
    ).length,
    missingToolCounts
  };
}

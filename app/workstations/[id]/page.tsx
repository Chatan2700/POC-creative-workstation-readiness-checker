import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  CreativeToolsPanel,
  DetailBackLink,
  DeviceIdentityPanel,
  DiagnosticPipeline,
  RawReportPreview,
  ReadinessScorePanel,
  RecommendationsPanel,
  ReportHeader,
  SystemHealthGrid
} from "@/components/report-detail";
import { getReport, getReports } from "@/lib/report";

type WorkstationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return getReports().map((report) => ({
    id: report.id
  }));
}

export default async function WorkstationPage({ params }: WorkstationPageProps) {
  const { id } = await params;
  const report = getReport(id);

  if (!report) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-[1280px] gap-6">
        <DetailBackLink />
        <ReportHeader report={report} />
        <ReadinessScorePanel report={report} />
        <SystemHealthGrid report={report} />
        <CreativeToolsPanel report={report} />
        <RecommendationsPanel report={report} />
        <DeviceIdentityPanel report={report} />
        <DiagnosticPipeline />
        <RawReportPreview report={report} />
      </div>
    </AppShell>
  );
}

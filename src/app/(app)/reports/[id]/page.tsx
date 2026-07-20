import { ReportPdfSection } from "@/components/reports/report-pdf-section";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportPdfSection id={id} />;
}

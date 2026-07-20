import { MeetingDetailSection } from "@/components/meetings/meeting-detail-section";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MeetingDetailSection id={id} />;
}

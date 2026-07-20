import { redirect } from "next/navigation";

/** Meeting Mode removed from SustainBL — use Meetings in the sidebar */
export default function SustainblMeetingRedirectPage() {
  redirect("/meetings");
}

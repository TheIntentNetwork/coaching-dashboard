import { redirect } from "next/navigation";

/** Timeline lives on Dashboard “Your Journey”; keep route for old bookmarks. */
export default function CaseFileTimelinePage() {
  redirect("/dashboard");
}

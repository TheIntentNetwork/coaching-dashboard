import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/server/auth";
import {
  DEFAULT_JOURNEY_FLAGS,
  defaultJourneyMilestones,
  type JourneyFlags,
  type JourneyMilestone,
} from "@/lib/portal/iep-journey-defaults";

function normalizeMilestones(raw: unknown): JourneyMilestone[] {
  const defaults = defaultJourneyMilestones();
  if (!Array.isArray(raw) || raw.length === 0) return defaults;

  const parsed: JourneyMilestone[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const id = String(obj.id || "").trim();
    if (!id || seen.has(id)) continue;

    const isCustom = Boolean(obj.custom) || id.startsWith("custom_");
    const defaultMeta = defaults.find((d) => d.id === id);
    if (!isCustom && !defaultMeta) continue;

    const done = Boolean(obj.done);
    const label =
      isCustom && typeof obj.label === "string" && obj.label.trim()
        ? obj.label.trim().slice(0, 120)
        : defaultMeta!.label;
    const guidance =
      isCustom && typeof obj.guidance === "string"
        ? obj.guidance.trim().slice(0, 400)
        : defaultMeta?.guidance || "";

    parsed.push({
      id,
      label,
      guidance,
      done,
      completed_at:
        done && typeof obj.completed_at === "string"
          ? obj.completed_at
          : done
            ? new Date().toISOString()
            : null,
      ...(isCustom ? { custom: true } : {}),
    });
    seen.add(id);
  }

  for (const d of defaults) {
    if (!seen.has(d.id)) {
      parsed.push(d);
      seen.add(d.id);
    }
  }

  return parsed;
}

function normalizeFlags(raw: unknown): JourneyFlags {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_JOURNEY_FLAGS };
  const obj = raw as Record<string, unknown>;
  return {
    review_ard: Boolean(obj.review_ard),
    mdard: Boolean(obj.mdard),
    staar_failure: Boolean(obj.staar_failure),
  };
}

export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from("portal_iep_journey")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      journey: {
        user_id: auth.user.id,
        milestones: defaultJourneyMilestones(),
        flags: { ...DEFAULT_JOURNEY_FLAGS },
      },
    });
  }

  return NextResponse.json({
    journey: {
      ...data,
      milestones: normalizeMilestones(data.milestones),
      flags: normalizeFlags(data.flags),
    },
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    milestones?: JourneyMilestone[];
    flags?: JourneyFlags;
  };

  const milestones = normalizeMilestones(body.milestones);
  const flags = normalizeFlags(body.flags);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("portal_iep_journey")
    .upsert(
      {
        user_id: auth.user.id,
        milestones,
        flags,
        updated_at: now,
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    journey: {
      ...data,
      milestones: normalizeMilestones(data.milestones),
      flags: normalizeFlags(data.flags),
    },
  });
}

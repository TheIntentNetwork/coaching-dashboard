export type PrepTemplateItem = {
  item_type: "question" | "note" | "checklist";
  title?: string;
  body: string;
};

export type PrepTemplate = {
  key: string;
  label: string;
  description: string;
  items: PrepTemplateItem[];
};

export const PREP_TEMPLATES: PrepTemplate[] = [
  {
    key: "default_iep",
    label: "Default IEP prep",
    description: "Most common parent questions, notes, and a short checklist for the meeting.",
    items: [
      {
        item_type: "question",
        title: "Ask about reading intervention hours",
        body: "How many minutes per week of reading intervention are currently delivered, and is that enough for current progress?",
      },
      {
        item_type: "question",
        title: "Clarify goal measurement",
        body: "How will progress on each IEP goal be measured and shared with us between meetings?",
      },
      {
        item_type: "question",
        title: "Confirm accommodations in class",
        body: "Which accommodations are used daily in the classroom, and which ones need more consistency?",
      },
      {
        item_type: "note",
        body: "At home we see stronger focus after short movement breaks. Worth asking whether sensory breaks can be built into the morning block.",
      },
      {
        item_type: "note",
        body: "Bring the latest progress report and highlight any goals that feel stalled.",
      },
      {
        item_type: "checklist",
        title: "Bring current IEP draft",
        body: "Print or open the latest draft and mark pages with questions.",
      },
      {
        item_type: "checklist",
        title: "List top 3 priorities",
        body: "Write the three outcomes that matter most for this meeting.",
      },
      {
        item_type: "checklist",
        title: "Confirm who will attend",
        body: "Know which school staff and related-service providers will be present.",
      },
    ],
  },
  {
    key: "eligibility_focus",
    label: "Eligibility focus",
    description: "Starter set for initial eligibility or re-evaluation meetings.",
    items: [
      {
        item_type: "question",
        title: "Explain evaluation findings",
        body: "Can you walk through the evaluation results in plain language and what they mean for school?",
      },
      {
        item_type: "question",
        title: "Eligibility criteria",
        body: "Which eligibility category is being considered, and what evidence supports it?",
      },
      {
        item_type: "note",
        body: "Share specific examples of classroom struggles and home observations that evaluations may not capture.",
      },
      {
        item_type: "checklist",
        title: "Bring prior evaluations",
        body: "Have private or previous school evaluations ready if available.",
      },
      {
        item_type: "checklist",
        title: "Write concerns in advance",
        body: "List academic, social, and functional concerns before the meeting starts.",
      },
    ],
  },
];

export function getPrepTemplate(key: string): PrepTemplate | null {
  return PREP_TEMPLATES.find((t) => t.key === key) ?? null;
}

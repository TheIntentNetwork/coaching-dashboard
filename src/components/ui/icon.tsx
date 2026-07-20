import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  Lightbulb,
  ListChecks,
  Mail,
  MessageCircle,
  Mic,
  Settings,
  Sparkles,
  Upload,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  settings: Settings,
  home: Home,
  "book-open": BookOpen,
  mic: Mic,
  mail: Mail,
  "file-text": FileText,
  sparkles: Sparkles,
  folder: FolderOpen,
  list: ListChecks,
  timeline: Calendar,
  upload: Upload,
  file: FileText,
  edit: ListChecks,
  calendar: Calendar,
  lightbulb: Lightbulb,
  chat: MessageCircle,
  chevron: ChevronRight,
  user: UserRound,
};

type IconProps = {
  name: string;
  className?: string;
  size?: number;
};

export function Icon({ name, className, size = 20 }: IconProps) {
  const Cmp = MAP[name] ?? FileText;
  return <Cmp className={className} size={size} aria-hidden />;
}

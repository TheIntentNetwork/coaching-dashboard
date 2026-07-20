import Image from "next/image";
import { IMAGES } from "@/lib/images";

type AuthVisualPanelProps = {
  quote: string;
  attribution?: string;
  className?: string;
  imageClassName?: string;
};

export function AuthVisualPanel({
  quote,
  attribution = "— SustainBL Mission",
  className = "",
  imageClassName = "object-cover object-center",
}: AuthVisualPanelProps) {
  return (
    <div
      className={`relative h-[300px] w-full overflow-hidden rounded-2xl bg-surface-container shadow-soft lg:h-[700px] ${className}`}
    >
      <Image
        src={IMAGES.authHero}
        alt="Family preparing together for an IEP meeting"
        fill
        priority
        className={imageClassName}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-on-surface/55 via-on-surface/10 to-transparent" />
      <div className="absolute bottom-8 left-8 right-8 hidden rounded-xl border border-white/20 bg-surface/85 p-6 shadow-soft backdrop-blur-md md:block">
        <p className="font-display text-lg italic leading-snug text-on-surface">&ldquo;{quote}&rdquo;</p>
        <p className="mt-3 font-label text-xs font-bold uppercase tracking-widest text-primary">
          {attribution}
        </p>
      </div>
    </div>
  );
}

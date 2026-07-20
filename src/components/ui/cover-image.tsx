import Image from "next/image";

type CoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** Fill-parent editorial photo (parent must be relative + sized) */
export function CoverImage({ src, alt, className = "", priority = false }: CoverImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, 40vw"
      className={`object-cover ${className}`}
    />
  );
}

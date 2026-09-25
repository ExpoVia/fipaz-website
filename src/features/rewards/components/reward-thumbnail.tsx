import Image from "next/image";
import { clsx } from "clsx";
import { Gift } from "lucide-react";

const SIZES = {
  sm: { box: "h-10 w-10", px: 40, icon: "h-5 w-5" },
  md: { box: "h-14 w-14", px: 56, icon: "h-7 w-7" },
  lg: { box: "h-32 w-32", px: 128, icon: "h-12 w-12" },
} as const;

interface RewardThumbnailProps {
  imageUrl?: string;
  /** Nombre del premio: texto alternativo de la imagen. */
  name: string;
  size?: keyof typeof SIZES;
  /** Cuando el nombre ya aparece como texto al lado, la imagen es decorativa. */
  decorative?: boolean;
}

/** Imagen del premio o, si no tiene, un ícono como placeholder. */
export function RewardThumbnail({ imageUrl, name, size = "md", decorative = false }: RewardThumbnailProps) {
  const { box, px, icon } = SIZES[size];

  return (
    <span
      className={clsx(
        "grid shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-[var(--expo-line)] bg-[var(--expo-bg)]",
        box,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={decorative ? "" : name}
          width={px}
          height={px}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <Gift
          {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": `${name} (sin imagen)` })}
          className={clsx("text-slate-500", icon)}
        />
      )}
    </span>
  );
}

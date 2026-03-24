import Image from "next/image";
import { cn } from "@/lib/utils";

type SerenaMarkProps = {
  className?: string;
  priority?: boolean;
};

/** Serena logo from `/public/serena-mark.png` — parent should set size (e.g. `h-9 w-9`). */
export function SerenaMark({ className, priority }: SerenaMarkProps) {
  return (
    <Image
      src="/serena-mark.png"
      alt="Serena"
      width={256}
      height={256}
      className={cn("h-full w-full object-contain", className)}
      priority={priority}
    />
  );
}

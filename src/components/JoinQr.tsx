import { useMemo } from "react";
import BottleQr from "./BottleQr";

export default function JoinQr({
  label = "Scan to join",
  path = "/",
}: {
  label?: string;
  path?: string | null;
}) {
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    const dest = !path || path === "/" ? "" : path;
    return `${window.location.origin}${dest}`;
  }, [path]);
  if (!url) return null;
  return (
    <div className="hidden w-[13.75rem] shrink-0 flex-col items-center justify-center gap-3 self-center lg:flex">
      <div className="qr-foil flex h-[13.75rem] w-[13.75rem] items-center justify-center rounded-2xl border-2 border-rule bg-sheet p-3">
        <BottleQr url={url} size={196} />
      </div>
      <p className="kicker max-w-[13.75rem] text-center leading-snug">{label}</p>
    </div>
  );
}

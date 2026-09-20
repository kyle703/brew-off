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
    <div className="hidden shrink-0 flex-col items-center gap-3 lg:flex">
      <div className="rounded-2xl border-2 border-rule bg-sheet p-3">
        <BottleQr url={url} size={196} />
      </div>
      <p className="kicker">{label}</p>
    </div>
  );
}

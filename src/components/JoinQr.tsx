import { useMemo, useState } from "react";
import BottleQr from "./BottleQr";
import { useSession } from "../context/Session";
import { fileSlug, saveThemedQr } from "../lib/qr";

export default function JoinQr({
  label = "Scan to join",
  path = "/",
  alwaysShow = false,
  downloadable = false,
  fileName,
}: {
  label?: string;
  path?: string | null;
  alwaysShow?: boolean;
  downloadable?: boolean;
  fileName?: string;
}) {
  const { bootstrap } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    const dest = !path || path === "/" ? "" : path;
    return `${window.location.origin}${dest}`;
  }, [path]);
  if (!url) return null;

  const stem =
    fileName ||
    `${fileSlug(bootstrap?.competition.name ?? "brew-off")}-${fileSlug(label)}`;

  return (
    <div
      className={`${
        alwaysShow ? "flex" : "hidden lg:flex"
      } w-[13.75rem] shrink-0 flex-col items-center justify-center gap-3 self-center`}
    >
      <div className="qr-foil flex h-[13.75rem] w-[13.75rem] items-center justify-center rounded-2xl border-2 border-rule bg-sheet p-3">
        <BottleQr url={url} size={196} />
      </div>
      <p className="kicker max-w-[13.75rem] text-center leading-snug">{label}</p>
      {downloadable && (
        <>
          <button
            type="button"
            className="btn-secondary min-h-12 w-full"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setError(null);
              void saveThemedQr(url, stem)
                .catch((err: unknown) => {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Couldn’t save the QR code.",
                  );
                })
                .finally(() => setBusy(false));
            }}
          >
            {busy ? "Saving…" : "Save PNG"}
          </button>
          {error ? <p className="text-center text-sm text-red-800">{error}</p> : null}
        </>
      )}
    </div>
  );
}

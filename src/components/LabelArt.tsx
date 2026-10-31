import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import LabelImage from "./LabelImage";

type Props = {
  src?: string | null;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
};

export default function LabelArt({
  src,
  alt,
  open,
  onOpenChange,
  className = "",
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open, onOpenChange]);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        className={`relative block overflow-hidden rounded-xl border border-rule bg-[color-mix(in_srgb,black_45%,var(--paper))] text-left ${className}`}
        aria-label={`Expand label art, ${alt}`}
        aria-expanded={open}
        onClick={() => onOpenChange(true)}
      >
        <LabelImage src={src} alt="" fit="contain" className="aspect-[3/4] h-auto w-full" />
        <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper shadow-md">
          <ExpandIcon />
          Expand
        </span>
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex flex-col bg-black"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <p className="min-w-0 truncate font-display text-lg text-[#f3e6d0]">
                {alt}
              </p>
              <button
                ref={closeRef}
                type="button"
                className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-[#f3e6d0] px-4 text-sm font-semibold uppercase tracking-wide text-[#160e0a]"
                onClick={() => onOpenChange(false)}
              >
                Close
              </button>
            </div>
            <div
              className="flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onClick={() => onOpenChange(false)}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="max-h-full max-w-full object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function ExpandIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

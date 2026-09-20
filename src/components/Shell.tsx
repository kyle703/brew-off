import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "../context/Session";
import { guestStage, pathMatchesStage } from "../lib/stage";

export default function Shell({ children }: { children: ReactNode }) {
  const { bootstrap } = useSession();
  const location = useLocation();
  const competition = bootstrap?.competition;
  const stage = competition ? guestStage(competition) : null;
  const onStage = stage ? pathMatchesStage(location.pathname, stage) : false;
  const hosting = location.pathname.startsWith("/admin");
  const canRegister =
    Boolean(competition?.registrationOpen) &&
    !competition?.entriesFrozen &&
    stage?.status !== "registration" &&
    !location.pathname.startsWith("/register") &&
    !hosting;

  return (
    <div className="min-h-svh bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-rule/40 bg-paper/90 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-3 lg:max-w-5xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="min-w-0 truncate font-display text-lg tracking-wide text-accent sm:text-xl"
            >
              {competition?.name ?? "Brew-Off"}
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              {canRegister && (
                <Link
                  to="/register"
                  className="inline-flex min-h-11 items-center px-2 text-xs uppercase tracking-wide text-accent"
                >
                  Enter a beer
                </Link>
              )}
              <Link
                to="/admin"
                className="inline-flex min-h-11 items-center px-2 text-xs uppercase tracking-wide text-muted hover:text-accent"
              >
                Host
              </Link>
            </div>
          </div>
          {stage && !hosting &&
            (stage.to && !onStage ? (
              <Link
                to={stage.to}
                className="btn-primary flex w-full items-center justify-between gap-3 !normal-case tracking-normal"
              >
                <span className="min-w-0 text-left">
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums opacity-80">
                      {String(stage.n).padStart(2, "0")}
                    </span>
                    <span>{stage.label}</span>
                  </span>
                  <span className="mt-0.5 block text-sm font-normal opacity-90">
                    {stage.hint}
                  </span>
                </span>
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <div className="w-full rounded-xl border-2 border-accent/40 bg-accent/10 px-4 py-3">
                <div className="flex items-center gap-3 font-semibold">
                  <span className="tabular-nums text-accent">
                    {String(stage.n).padStart(2, "0")}
                  </span>
                  <span>{stage.label}</span>
                </div>
                <p className="mt-0.5 text-sm font-normal text-muted">{stage.hint}</p>
              </div>
            ))}
          {stage && hosting && (
            <p className="text-xs text-muted">
              Guests see {String(stage.n).padStart(2, "0")} · {stage.label}
            </p>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:max-w-5xl">
        {children}
      </main>
    </div>
  );
}

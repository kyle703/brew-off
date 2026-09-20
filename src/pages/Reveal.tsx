import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import ReactConfetti from "react-confetti";
import { Link } from "react-router-dom";
import { getReveal } from "../api";
import StageBeer from "../components/StageBeer";
import { useSession } from "../context/Session";
import { awardVoice, placeLine } from "../lib/awardVoice";
import { buildCeremony } from "../lib/ceremony";
import type { CeremonyStep } from "../lib/ceremony";
import type { LoadedData } from "../types";
import { DEFAULT_SCORING_SCHEMA } from "../types";

const enterMotion = {
  stamp: { initial: { opacity: 0, rotate: -7, scale: 1.12 }, animate: { opacity: 1, rotate: 0, scale: 1 } },
  pour: { initial: { opacity: 0, y: 64, filter: "blur(8px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" } },
  bounce: { initial: { opacity: 0, y: 28, scale: 0.92 }, animate: { opacity: 1, y: 0, scale: 1 } },
  linger: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } },
  crown: { initial: { opacity: 0, scale: 0.72 }, animate: { opacity: 1, scale: 1 } },
} as const;

export default function Reveal() {
  const { bootstrap } = useSession();
  const prefersReduced = useReducedMotion();
  const [data, setData] = useState<LoadedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (data) return;
    void getReveal()
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      );
  }, [bootstrap?.competition.status, data]);

  useEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const schema =
    bootstrap?.competition.scoringSchema ?? DEFAULT_SCORING_SCHEMA;
  const steps = useMemo(
    () => (data ? buildCeremony(schema, data.winners) : []),
    [data, schema],
  );
  const step = steps[index];
  const last = Math.max(0, steps.length - 1);

  const swipeX = useRef(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIndex((i) => Math.min(last, i + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  function onTouchStart(e: TouchEvent) {
    swipeX.current = e.touches[0]?.clientX ?? 0;
  }
  function onTouchEnd(e: TouchEvent) {
    const x = e.changedTouches[0]?.clientX ?? swipeX.current;
    const dx = x - swipeX.current;
    if (dx < -48) setIndex((i) => Math.min(last, i + 1));
    if (dx > 48) setIndex((i) => Math.max(0, i - 1));
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <div className="sheet max-w-md text-center">
          <h1 className="font-display text-3xl">The card is still closed</h1>
          <p className="mt-2 text-muted">{error}</p>
          <Link to="/" className="mt-4 inline-block text-accent">
            Home
          </Link>
        </div>
      </div>
    );
  }

  if (!data || !step) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted">
        Shuffling the card…
      </div>
    );
  }

  const competition = bootstrap?.competition;
  const published = competition?.status === "published";
  const voice = stepVoice(step);
  const burst = step.kind === "place" && step.place === 1;
  const grand = step.kind === "place" && step.champion;

  return (
    <div
      className={`relative flex min-h-svh flex-col overflow-hidden bg-paper text-ink ${voice.atmosphere}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <VoiceDecor decor={voice.decor} reduced={!!prefersReduced} />
      {burst && !prefersReduced && size.w > 0 && (
        <ReactConfetti
          width={size.w}
          height={size.h}
          numberOfPieces={grand ? 180 : 70}
          recycle={grand}
          gravity={grand ? 0.18 : 0.35}
          colors={grand ? ["#e3b341", "#f3e6d4", "#d4a054", "#ffffff"] : ["#8a6a2f", "#cbbfa8", "#6b4f2a"]}
        />
      )}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="w-full"
            initial={prefersReduced ? { opacity: 0 } : enterMotion[voice.enter].initial}
            animate={prefersReduced ? { opacity: 1 } : enterMotion[voice.enter].animate}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={
              voice.enter === "bounce" || voice.enter === "crown"
                ? { type: "spring", stiffness: 220, damping: 18 }
                : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {step.kind === "intro" && (
              <div className="text-center">
                <p className="kicker">{competition?.tagline}</p>
                <h1 className="mt-3 font-display text-[clamp(2.4rem,10vw,5.5rem)] leading-none text-accent">
                  {competition?.name ?? "Brew-Off"}
                </h1>
                <p className="mx-auto mt-6 max-w-md text-lg text-muted sm:text-2xl">
                  Quiet in the room. We’re calling the card.
                </p>
              </div>
            )}

            {step.kind === "category" && (
              <div className="text-center">
                <p className="kicker">{voice.kicker}</p>
                <h1 className="mt-3 font-display text-[clamp(2.6rem,12vw,6.5rem)] leading-[0.95] text-accent">
                  {step.criterion.label}
                </h1>
                <p className="mt-3 text-lg uppercase tracking-[0.18em] text-muted sm:text-xl">
                  {voice.title}
                </p>
                <p className="mx-auto mt-6 max-w-lg font-display text-xl italic text-ink sm:text-3xl">
                  {voice.tease}
                </p>
              </div>
            )}

            {step.kind === "place" && (
              <div className="w-full space-y-5 sm:space-y-8">
                <header className="text-center">
                  <p className="kicker">{step.criterion.label}</p>
                  <h1 className="font-display text-[clamp(1.8rem,7vw,3.5rem)] leading-tight">
                    {placeLine(voice, step.place, step.champion)}
                  </h1>
                  <p className="mt-2 text-sm text-muted">{voice.kicker}</p>
                </header>
                <StageBeer
                  beer={step.beer}
                  score={step.beer.scores[step.criterion.id]}
                  showNotes={step.place === 1}
                  punch={step.champion}
                />
              </div>
            )}

            {step.kind === "close" && (
              <div className="space-y-6 text-center">
                <p className="kicker">That’s the card</p>
                <h1 className="font-display text-[clamp(3rem,12vw,6rem)] leading-none text-accent">
                  Prost.
                </h1>
                {published ? (
                  <Link to="/results" className="btn-primary">
                    Full ranking
                  </Link>
                ) : (
                  <p className="text-muted">The ranking opens when the host publishes.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className="btn-secondary min-h-12 min-w-[4.5rem]"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </button>
        <p className="text-center text-xs uppercase tracking-widest text-muted">
          {index + 1} / {steps.length}
          <span className="mt-1 block normal-case tracking-normal sm:hidden">
            Swipe to keep going
          </span>
        </p>
        <button
          type="button"
          className="btn-primary min-h-12 min-w-[4.5rem]"
          disabled={index === last}
          onClick={() => setIndex((i) => Math.min(last, i + 1))}
        >
          {index === last ? "Done" : "Next"}
        </button>
      </footer>
    </div>
  );
}

function stepVoice(step: CeremonyStep) {
  if (step.kind === "category" || step.kind === "place") {
    return awardVoice(step.criterion.id, step.criterion.label);
  }
  if (step.kind === "close") return awardVoice("overall");
  return {
    ...awardVoice("overall"),
    atmosphere: "voice-plain",
    decor: "none" as const,
    enter: "linger" as const,
  };
}

function VoiceDecor({
  decor,
  reduced,
}: {
  decor: ReturnType<typeof awardVoice>["decor"];
  reduced: boolean;
}) {
  if (decor === "none") return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {decor === "frame" && (
        <>
          <span className="voice-frame left-3 top-3 border-l-4 border-t-4 sm:left-6 sm:top-6" />
          <span className="voice-frame right-3 top-3 border-r-4 border-t-4 sm:right-6 sm:top-6" />
          <span className="voice-frame bottom-3 left-3 border-b-4 border-l-4 sm:bottom-6 sm:left-6" />
          <span className="voice-frame bottom-3 right-3 border-b-4 border-r-4 sm:bottom-6 sm:right-6" />
        </>
      )}
      {decor === "liquid" && <div className="voice-liquid" />}
      {decor === "bubbles" &&
        (reduced
          ? null
          : [
              { left: "12%", size: 14, delay: "0s", dur: "9s" },
              { left: "28%", size: 8, delay: "1.4s", dur: "7s" },
              { left: "47%", size: 18, delay: "0.6s", dur: "11s" },
              { left: "63%", size: 10, delay: "2.2s", dur: "8s" },
              { left: "81%", size: 16, delay: "1s", dur: "10s" },
            ].map((b) => (
              <span
                key={b.left}
                className="voice-bubble"
                style={{
                  left: b.left,
                  width: b.size,
                  height: b.size,
                  animationDelay: b.delay,
                  animationDuration: b.dur,
                }}
              />
            )))}
      {decor === "steam" && (
        <>
          <div className="voice-steam" style={{ marginLeft: "-6rem" }} />
          <div
            className="voice-steam"
            style={{ marginLeft: "1rem", animationDelay: "1.6s", width: "6rem", height: "6rem" }}
          />
        </>
      )}
      {decor === "rays" && !reduced && <div className="voice-rays" />}
    </div>
  );
}

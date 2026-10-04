import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Beer, BeerScores, LoadedData, WinnerCategory } from "../types";
import EntryOverlayCard from "./EntryOverlayCard";
import ConfettiEffect from "./ConfettiEffect";

const CATEGORY_ORDER: WinnerCategory[] = [
  "Label",
  "Color",
  "Drinkability",
  "Flavor",
  "Overall",
];

const TITLE: Record<WinnerCategory, string> = {
  Label: "Best Label",
  Color: "Best Color",
  Drinkability: "Most Drinkable",
  Flavor: "Best Flavor",
  Overall: "Grand Champion",
};

const SCORE_KEY: Record<WinnerCategory, keyof BeerScores> = {
  Label: "label",
  Color: "color",
  Drinkability: "drinkability",
  Flavor: "flavor",
  Overall: "overall",
};

type Beat =
  | { key: string; kind: "intro"; ms: number; title: string }
  | {
      key: string;
      kind: "podium";
      ms: number;
      title: string;
      category: WinnerCategory;
      winners: Beer[];
    }
  | { key: string; kind: "close"; ms: number; title: string };

type Props = { data: LoadedData };

export default function RevealShow({ data }: Props) {
  const navigate = useNavigate();
  const beats = buildBeats(data);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const beat = beats[Math.min(index, beats.length - 1)];

  const go = useCallback(
    (next: number) => {
      if (next >= beats.length) {
        navigate("/");
        return;
      }
      setIndex(Math.max(0, next));
    },
    [beats.length, navigate]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  return (
    <div className="relative min-h-[calc(100svh-var(--nav-h))]">
      <div className="sr-only" aria-live="polite">
        {beat.title}
      </div>

      <div className="flex min-h-[calc(100svh-var(--nav-h))] flex-col items-center justify-center px-4 pb-28 pt-4 sm:pt-6">
        {beat.kind === "intro" && <Intro />}
        {beat.kind === "podium" && (
          <PodiumBeat
            title={beat.title}
            winners={beat.winners}
            scoreKey={SCORE_KEY[beat.category]}
            champion={beat.category === "Overall"}
          />
        )}
        {beat.kind === "close" && <Close />}
      </div>

      {beat.kind === "podium" && beat.category === "Overall" && (
        <ConfettiEffect active duration={beat.ms} intensity="grand" />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
        <div className="mx-auto flex max-w-xl gap-1.5">
          {beats.map((b, i) => (
            <div
              key={b.key}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/15"
            >
              {i < index ? <div className="h-full w-full bg-gold-600" /> : null}
              {i === index ? (
                <RunningBar
                  key={index}
                  duration={b.ms}
                  paused={paused}
                  onDone={() => go(index + 1)}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-3 flex max-w-xl items-center justify-center gap-3 sm:justify-between">
          <div className="flex gap-3">
            <RoundButton label="Previous" onClick={() => go(index - 1)} disabled={index === 0}>
              <Chevron dir="left" />
            </RoundButton>
            <RoundButton label={paused ? "Play" : "Pause"} onClick={() => setPaused((p) => !p)} gold>
              {paused ? <PlayIcon /> : <PauseIcon />}
            </RoundButton>
            <RoundButton label="Next" onClick={() => go(index + 1)}>
              <Chevron dir="right" />
            </RoundButton>
          </div>
          <Link
            to="/"
            className="hidden text-sm font-semibold uppercase tracking-widest text-amber-300 hover:text-amber-200 sm:inline"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function buildBeats(data: LoadedData): Beat[] {
  const beats: Beat[] = [
    { key: "intro", kind: "intro", ms: 2400, title: "Golden Spoon 2025" },
  ];
  for (const category of CATEGORY_ORDER) {
    const winners = data.winners[category] ?? [];
    if (winners.length === 0) continue;
    beats.push({
      key: category,
      kind: "podium",
      ms: category === "Overall" ? 4800 : 3400,
      title: TITLE[category],
      category,
      winners: winners.slice(0, 3),
    });
  }
  beats.push({ key: "close", kind: "close", ms: 2600, title: "Prost" });
  return beats;
}

function Intro() {
  return (
    <div className="text-center">
      <h1 className="heading-fest text-4xl sm:text-7xl">Aug-toberfest</h1>
      <p className="mt-3 flex items-center justify-center gap-2 text-amber-400">
        <span aria-hidden style={{ transform: "scaleX(-1)" }}>
          🍺
        </span>
        <span className="heading-fest text-lg tracking-wide sm:text-3xl sm:tracking-widest">
          Golden Spoon 2025
        </span>
        <span aria-hidden>🍺</span>
      </p>
      <img
        src={`${import.meta.env.BASE_URL}golden_spoon_hero.png`}
        alt=""
        className="mx-auto mt-4 h-28 w-auto sm:h-52"
      />
      <p className="mt-4 text-lg text-cream-100/80">Calling the card.</p>
    </div>
  );
}

function PodiumBeat({
  title,
  winners,
  scoreKey,
  champion,
}: {
  title: string;
  winners: Beer[];
  scoreKey: keyof BeerScores;
  champion: boolean;
}) {
  const gold = winners[0];
  const silver = winners[1];
  const bronze = winners[2];
  const seats = [
    silver ? { beer: silver, place: 2 as const } : null,
    gold ? { beer: gold, place: 1 as const } : null,
    bronze ? { beer: bronze, place: 3 as const } : null,
  ].filter((seat): seat is { beer: Beer; place: 1 | 2 | 3 } => seat !== null);

  return (
    <div className="w-full text-center">
      <h2 className="heading-fest text-4xl leading-none sm:text-6xl">{title}</h2>
      <div className="mx-auto mt-4 w-full max-w-sm md:hidden">
        {gold && (
          <div className="flex flex-col items-center">
            <EntryOverlayCard
              imageUrl={gold.img || ""}
              name={gold.name}
              entryId={gold.entryId}
              brewer={gold.brewer}
              size="docked"
              width="min(200px, 54vw)"
            />
            <ScoreChip value={gold.scores[scoreKey]} />
          </div>
        )}
        <div className="mt-4 space-y-2 text-left">
          {silver && <RunnerRow place="2nd" beer={silver} score={silver.scores[scoreKey]} />}
          {bronze && <RunnerRow place="3rd" beer={bronze} score={bronze.scores[scoreKey]} />}
        </div>
      </div>
      <div className="mt-8 hidden items-end justify-center gap-4 md:flex">
        {seats.map(({ beer, place }) => {
          const featured = place === 1;
          return (
            <div
              key={beer.entryId}
              className={featured ? "-translate-y-4" : ""}
            >
              <p className="mb-2 font-fraktur text-2xl text-amber-300">
                {place === 1 ? "1st" : place === 2 ? "2nd" : "3rd"}
              </p>
              <EntryOverlayCard
                imageUrl={beer.img || ""}
                name={beer.name}
                entryId={beer.entryId}
                brewer={beer.brewer}
                size="docked"
                width={featured ? "min(260px, 28vw)" : "min(190px, 20vw)"}
                scoreBadgeValue={beer.scores[scoreKey]}
              />
            </div>
          );
        })}
      </div>
      {champion && gold && (
        <p className="mt-6 hidden text-lg text-cream-100/80 md:block">
          {gold.brewer}
          {gold.style ? ` · ${gold.style}` : ""}
        </p>
      )}
    </div>
  );
}

function ScoreChip({ value }: { value: number }) {
  return (
    <div className="mt-3 flex h-11 w-[4.5rem] items-center justify-center rounded-xl border-[3px] border-gold-600 bg-parchment text-2xl font-bold text-navy-900">
      {value.toFixed(1)}
    </div>
  );
}

function RunnerRow({
  place,
  beer,
  score,
}: {
  place: string;
  beer: Beer;
  score: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-gold-600/70 bg-navy-900/70 px-3 py-2">
      <span className="w-8 shrink-0 font-fraktur text-lg text-amber-300">{place}</span>
      {beer.img ? (
        <img
          src={beer.img}
          alt=""
          referrerPolicy="no-referrer"
          className="h-11 w-11 shrink-0 rounded-full border-2 border-gold-600 object-cover"
        />
      ) : (
        <span className="h-11 w-11 shrink-0 rounded-full border-2 border-gold-600 bg-navy-800" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-fraktur text-xl leading-none text-cream-100">{beer.name}</span>
        <span className="mt-1 block truncate text-xs text-cream-100/70">{beer.brewer}</span>
      </span>
      <span className="shrink-0 text-lg font-bold text-amber-200">{score.toFixed(1)}</span>
    </div>
  );
}

function Close() {
  return (
    <div className="text-center">
      <h2 className="heading-fest text-6xl sm:text-7xl">Prost</h2>
      <p className="mt-4 text-xl text-cream-100/85">That’s the card.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-[16px] bg-amber-500 px-8 py-4 text-lg font-bold uppercase text-navy-900 hover:bg-amber-400"
      >
        Leaderboard
      </Link>
    </div>
  );
}

function RunningBar({
  duration,
  paused,
  onDone,
}: {
  duration: number;
  paused: boolean;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    let finished = false;
    const tick = (now: number) => {
      elapsed.current += now - last;
      last = now;
      const next = Math.min(1, elapsed.current / duration);
      setProgress(next);
      if (next >= 1) {
        if (!finished) {
          finished = true;
          onDoneRef.current();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, duration]);

  return (
    <div className="h-full bg-gold-600" style={{ width: `${progress * 100}%` }} />
  );
}

function RoundButton({
  children,
  label,
  onClick,
  disabled,
  gold,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  gold?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full p-3 shadow-lg backdrop-blur-sm disabled:opacity-40 ${
        gold
          ? "bg-amber-600/90 text-white hover:bg-amber-500"
          : "bg-slate-800/80 text-white hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

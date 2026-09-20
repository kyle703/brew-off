import { Link } from "react-router-dom";
import BrewerMarquee from "../components/BrewerMarquee";
import BottleGrid from "../components/BottleGrid";
import JoinQr from "../components/JoinQr";
import TasterName from "../components/TasterName";
import { useSession } from "../context/Session";
import { guestCanRegister, guestStage } from "../lib/stage";
import { themePack } from "../lib/themePack";

export default function Home() {
  const { bootstrap, loading, error } = useSession();

  if (loading) return <p className="text-muted">Loading the flight…</p>;
  if (error || !bootstrap) {
    return <p className="text-muted">{error || "Nothing brewing yet."}</p>;
  }

  const { competition, entries, ballots } = bootstrap;
  const pack = themePack(competition.themeId);
  const story = pack?.story;
  const stage = guestStage(competition);
  const tasting = competition.tastingOpen || competition.status === "tasting";
  const canRegister = guestCanRegister(competition);
  const active = entries.filter((e) => e.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
        <div className="sheet w-full max-w-lg space-y-3 text-center">
          {!tasting && story ? (
            <>
              <p className="kicker">{story.kicker}</p>
              <h1
                className={`text-4xl text-accent sm:text-5xl ${
                  pack?.wordmark ? "wordmark" : "font-display"
                }`}
              >
                {competition.name}
              </h1>
              {competition.tagline && (
                <p className="font-display text-lg text-ink sm:text-xl">
                  {competition.tagline}
                </p>
              )}
              <p className="text-sm text-muted sm:text-base">{story.motto}</p>
              <div className="space-y-1 text-sm text-muted">
                <p>{story.when}</p>
                <p>{story.where}</p>
              </div>
              <p className="kicker pt-1">{story.defending}</p>
            </>
          ) : (
            <>
              {competition.tagline && <p className="kicker">{competition.tagline}</p>}
              <h1 className="font-display text-4xl text-accent sm:text-5xl">
                {tasting ? "What’s in your glass?" : competition.name}
              </h1>
            </>
          )}
          <p className="text-base text-muted sm:text-lg">{stage.hint}</p>
          {tasting && (
            <p className="text-sm text-muted">
              {ballots.length} of {active.length} scored
            </p>
          )}
          {stage.to && stage.to !== "/" && (
            <Link to={stage.to} className="btn-primary inline-flex">
              {String(stage.n).padStart(2, "0")} · {stage.label}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {canRegister && (
            <JoinQr path="/register" label="Register a beer" />
          )}
          {tasting && <JoinQr path="/" label="Score bottles" />}
        </div>
      </div>

      {!tasting && active.length > 0 && <BrewerMarquee entries={active} />}

      {tasting && (
        <>
          <TasterName />
          <BottleGrid
            entries={active}
            ballots={ballots}
            schema={competition.scoringSchema}
            display={competition.tastingDisplay}
            locked={!competition.tastingOpen}
          />
        </>
      )}
    </div>
  );
}

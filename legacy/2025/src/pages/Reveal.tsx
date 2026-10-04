import { useData } from "../context/DataProvider";
import RevealShow from "../components/RevealShow";

export default function Reveal() {
  const { data, loading, error } = useData();

  if (error) {
    return <div className="p-8 text-center text-red-400">Failed to load the 2025 card.</div>;
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-[calc(100svh-var(--nav-h))] items-center justify-center text-amber-200">
        Loading the card…
      </div>
    );
  }

  return <RevealShow data={data} />;
}

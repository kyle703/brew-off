import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useData } from "../context/DataProvider";
import BeerCardScroll from "../components/BeerCardScroll";
import BavarianQRCode from "../components/BavarianQRCode";
import { hasSeenReveal } from "../utils/cookies";

export default function Splash() {
  const { data, loading } = useData();
  const [revealSeen, setRevealSeen] = useState(false);

  useEffect(() => {
    // Check if reveal has been seen
    setRevealSeen(hasSeenReveal());
  }, []);

  return (
    <div className="flex min-h-[calc(100svh-var(--nav-h))] flex-col gap-5 md:gap-1">
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="grid items-center md:grid-cols-[auto,1fr,auto] gap-12">
          {/* Left QR (Registration) */}
          <div className="flex justify-center">
            <div className="origin-center">
              <BavarianQRCode
                url="https://docs.google.com/forms/d/e/1FAIpQLSeXQtQiWZwWyjDuR74Vt4aYOeTXq5uk2UUrtEcRvDFJuiGPnQ/viewform?usp=header"
                label="Registration"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <div className="backdrop-blur-[1px]">
              <h1 className="heading-fest text-6xl">Aug-toberfest</h1>
              <div className="mt-1 flex items-center justify-center gap-2 text-amber-400 font-semibold">
                <span
                  role="img"
                  aria-label="beer"
                  style={{ transform: "scaleX(-1)" }}
                >
                  🍺
                </span>
                <span className="heading-fest tracking-widest">Golden Spoon 2025</span>
                <span role="img" aria-label="beer">
                  🍺
                </span>
              </div>
              {/* Golden Spoon under the title */}
              <div className="mt-3 flex items-center justify-center">
                <img src="/golden_spoon_hero.png" alt="Golden Spoon" className="h-64 w-auto" />
              </div>
            </div>
          </div>

          {/* Right QR (Judging) */}
          <div className="flex justify-center">
            <div className="origin-center">
              <BavarianQRCode
                url="https://docs.google.com/forms/d/e/1FAIpQLSduUYgnW7G2SvWuDPhXf9X6H2IIQT9kQ09OWqWBVGyGp71KpQ/viewform?usp=header"
                label="Judging"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Beer Card Scroll Section */}
      <div className="w-screen">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-amber-200">Loading beer entries...</div>
          </div>
        ) : (
          <BeerCardScroll beers={data?.beerList || []} />
        )}
      </div>

      {/* CTAs */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-6 pb-3 text-center md:gap-3 md:px-8">
        <div className="w-full max-w-xl">
          {revealSeen ? (
            <RouterLink
              to="/results"
              className="block rounded-[16px] bg-amber-500 px-10 py-5 text-xl font-bold uppercase text-navy-900 shadow hover:bg-amber-400 transition md:text-2xl"
            >
              See Results
            </RouterLink>
          ) : (
            <RouterLink
              to="/reveal"
              className="block rounded-[16px] bg-amber-500 px-10 py-5 text-xl font-bold uppercase text-navy-900 shadow hover:bg-amber-400 transition md:text-2xl"
            >
              Start Reveal
            </RouterLink>
          )}
        </div>
      </div>
    </div>
  );
}

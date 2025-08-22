import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadData } from "../data/fetch";
import type { LoadedData } from "../types";
import BeerCardScroll from "../components/BeerCardScroll";
import BavarianQRCode from "../components/BavarianQRCode";

export default function Splash() {
  const [data, setData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData()
      .then((loadedData) => {
        setData(loadedData);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load data:", e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-[calc(100svh-var(--nav-h))] flex-col gap-5 md:gap-6">
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 pt-4 text-center md:px-8">
        <div className="backdrop-blur-[1px]">
          <h1 className="heading-fest text-5xl md:text-7xl">
            Aug-toberfest Brew-Off
          </h1>
          <div className="mt-1 flex items-center justify-center gap-2 text-amber-400 text-2xl font-semibold">
            <span
              role="img"
              aria-label="beer"
              style={{ transform: "scaleX(-1)" }}
              className="text-5xl"
            >
              🍺
            </span>
            <span className="heading-fest tracking-widest text-5xl">2025</span>
            <span className="text-5xl" role="img" aria-label="beer">
              🍺
            </span>
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

      {/* QR Code Section */}
      <div className="w-full px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          <BavarianQRCode
            url="https://docs.google.com/forms/d/e/1FAIpQLSeXQtQiWZwWyjDuR74Vt4aYOeTXq5uk2UUrtEcRvDFJuiGPnQ/viewform?usp=header"
            label="Registration"
          />
          
          {/* Golden Spoon Hero Image */}
          <div className="hidden md:block w-[300px] h-[300px] flex items-center justify-center">
            <img 
              src="/golden_spoon_hero.png" 
              alt="Golden Spoon Hero" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <BavarianQRCode
            url="https://docs.google.com/forms/d/e/1FAIpQLSduUYgnW7G2SvWuDPhXf9X6H2IIQT9kQ09OWqWBVGyGp71KpQ/viewform?usp=header"
            label="Judging"
          />
        </div>
      </div>

      {/* CTAs */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-6 pb-3 text-center md:gap-3 md:px-8">
        <div className="w-full max-w-xl">
          <RouterLink
            to="/results"
            className="block rounded-[16px] bg-amber-500 px-10 py-5 text-xl font-bold uppercase text-navy-900 shadow hover:bg-amber-400 transition md:text-2xl"
          >
            See Results
          </RouterLink>
        </div>
      </div>
    </div>
  );
}

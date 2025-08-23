import { useEffect, useMemo, useState } from "react";
import { loadData } from "../data/fetch";
import type { Beer } from "../types";
import { listDriveFolder, toDirectImageUrl } from "../data/drive";
import DriveImage from "./DriveImage";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

function driveShareToDirect(url: string | undefined): string | null {
  if (!url) return null;
  try {
    // Patterns to support:
    // - https://drive.google.com/open?id=FILE_ID
    // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // - https://drive.google.com/uc?export=view&id=FILE_ID
    const openMatch = url.match(/[?&]id=([^&#]+)/);
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    const ucMatch = url.match(/[?&]id=([^&#]+)/);
    const id = (openMatch?.[1] || fileMatch?.[1] || ucMatch?.[1]) ?? null;
    if (!id) return url; // fallback to raw
    return `https://drive.google.com/uc?export=view&id=${id}`;
  } catch {
    return url;
  }
}

export default function LabelCarousel() {
  const [beers, setBeers] = useState<Beer[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const d = await loadData(true);
        setBeers(d.beerList);

        // 1) Prefer a static index (no secrets). Either /labels.json or custom path via env.
        const indexPath =
          (import.meta.env.VITE_DRIVE_INDEX_JSON as string | undefined) ||
          "/labels.json";
        try {
          const res = await fetch(indexPath, { cache: "no-store" });
          if (res.ok) {
            const arr = (await res.json()) as Array<
              { id?: string; url?: string; name?: string } | string
            >;
            if (Array.isArray(arr) && arr.length) {
              const imgs = arr
                .map((it, idx) => {
                  if (typeof it === "string") {
                    return { src: it, alt: `Label ${idx + 1}`, id: `${idx}` };
                  }
                  const src = it.url || (it.id ? toDirectImageUrl(it.id) : "");
                  return src
                    ? { src, alt: it.name || `Label ${idx + 1}`, id: `${idx}` }
                    : null;
                })
                .filter(Boolean) as { src: string; alt: string; id: string }[];
              if (imgs.length) {
                setDriveImages(imgs);
                return; // use static index and stop here
              }
            }
          }
        } catch {
          // ignore missing index (404)
        }

        // 2) If no static index, attempt listing public Drive folder (no key), else fallback to registrant images only.
        const folder = import.meta.env.VITE_DRIVE_URL as string | undefined;
        if (folder) {
          const files = await listDriveFolder(folder);
          if (files.length) {
            setDriveImages(
              files.map((f) => ({
                src: toDirectImageUrl(f.id),
                alt: f.name,
                id: f.id,
              }))
            );
          }
        }
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      }
    }
    init();
  }, []);

  const [driveImages, setDriveImages] = useState<
    { src: string; alt: string; id: string }[]
  >([]);

  const slides = useMemo(() => {
    const fromBeers = beers
      .map((b) => ({
        src: driveShareToDirect(b.img),
        alt: `${b.name}${b.brewer ? ` — ${b.brewer}` : ""}`,
        id: b.entryId,
      }))
      .filter((i) => !!i.src);
    const images = driveImages.length
      ? driveImages
      : (fromBeers as { src: string; alt: string; id: string }[]);
    // dedupe by src
    const seen = new Set<string>();
    return images.filter((i) => {
      if (!i.src) return false;
      if (seen.has(i.src)) return false;
      seen.add(i.src);
      return true;
    });
  }, [beers, driveImages]);

  if (err) return <div style={{ color: "tomato" }}>{err}</div>;
  if (!slides.length) return null;

  return (
    <div className="w-full h-full autoscroll overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        allowTouchMove={false}
        spaceBetween={24}
        breakpoints={{
          0: { slidesPerView: 1.15 },
          480: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.0 },
          1280: { slidesPerView: 2.4 },
        }}
        style={{ height: "100%", padding: "8px 16px 20px" }}
        loop
        speed={10000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        centeredSlides
        centeredSlidesBounds
      >
        {slides.map((img) => (
          <SwiperSlide key={img.id}>
            <div className="mx-auto h-full max-h-full w-full max-w-[640px] rounded-[14px] bg-cream-200/5 p-2 ring-1 ring-white/10 overflow-hidden">
              <DriveImage
                driveIdOrUrl={img.src as string}
                alt={`beer label ${img.alt}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

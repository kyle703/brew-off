import { motion } from "framer-motion";
import CategoryBanner from "./CategoryBanner";
import RankBadge from "./RankBadge";
import type { Beer, BeerScores, WinnerCategory } from "../types";

const GOLD_ACCENT = "#E3B341";
const GOLD_HAIRLINE = "#F1D98A";
const NAVY_INK = "#0E1623";
const PARCHMENT = "#F3E9D2";

const categoryLabel: Record<WinnerCategory, string> = {
	Overall: "Overall",
	Label: "Label",
	Color: "Color",
	Drinkability: "Drinkability",
	Flavor: "Flavor",
};

const metricKey: Record<WinnerCategory, keyof BeerScores> = {
	Label: "label",
	Color: "color",
	Drinkability: "drinkability",
	Flavor: "flavor",
	Overall: "overall",
};

type Props = {
	category: WinnerCategory;
	rows: Beer[];
	className?: string;
};

export default function CategoryPlacard({ category, rows, className = "" }: Props) {
	const key = metricKey[category];
	const sorted = [...rows].sort((a, b) => (b.scores[key] - a.scores[key]) || (b.scores.votes - a.scores.votes) || a.entryId.localeCompare(b.entryId));

	return (
		<section className={`w-full max-w-[1200px] mx-auto ${className}`} aria-label={`${categoryLabel[category]} results`}>
			{/* Placard panel */}
			<div className="px-1 sm:px-6">
				<div
					className="relative rounded-[24px]"
					style={{
						background: NAVY_INK,
						boxShadow: "0 10px 24px rgba(14,22,35,0.25)",
						border: `2px solid ${GOLD_ACCENT}`,
					}}
				>
					<div className="rounded-[22px]" style={{ border: `2px solid ${NAVY_INK}` }}>
						<div className="px-2.5 pb-4 pt-4 sm:px-6 sm:pb-8 sm:pt-6">
							<CategoryBanner
								title={categoryLabel[category]}
								subtitle="Averages based on crowd ratings"
								showCrown={category === "Overall"}
							/>

							{/* Desktop-only row tiles */}
							<motion.ul
								initial="hidden"
								animate="visible"
								variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
								className="mt-4 space-y-2 sm:mt-6 sm:space-y-4"
							>
								{sorted.slice(0, 10).map((b, i) => (
									<motion.li key={b.entryId} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
										<div className="grid grid-cols-[2.25rem_minmax(0,1fr)_3.25rem] items-center gap-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_6.75rem] sm:gap-4">
											<div className="flex items-center justify-center sm:hidden">
												<RankBadge rank={i + 1} size={36} />
											</div>
											<div className="hidden items-center justify-center sm:flex">
												<RankBadge rank={i + 1} size={56} />
											</div>

											<div className="min-w-0 font-fraktur">
												<div className="flex items-center rounded-[10px]" style={{ background: PARCHMENT, border: `2px solid ${GOLD_HAIRLINE}` }}>
													<div className="flex w-full min-w-0 items-center justify-between gap-3 px-3 py-2 sm:gap-4 sm:px-5 sm:py-3">
														<div className="min-w-0 text-[#0E1623]">
															<div className="truncate text-[12px] leading-none opacity-80 sm:text-[18px]">{b.brewer || "—"}</div>
															<div className="mt-1 line-clamp-2 font-fraktur text-[1.15rem] leading-tight sm:truncate sm:text-[34px] sm:leading-none" title={b.name}>{b.name}</div>
														</div>
														<div className="hidden shrink-0 items-center sm:flex">
															<div style={{ width: 2, height: 44, background: GOLD_ACCENT }} />
															<div className="ml-4 flex items-center gap-2 text-[18px] text-[#0E1623]">
																<span>ABV</span>
																<span>{b.abv == null ? "—" : `${b.abv.toFixed(1).replace(".", ",")}%`}</span>
															</div>
														</div>
													</div>
												</div>
											</div>

											<div
												className="flex h-11 w-[3.25rem] items-center justify-center rounded-[12px] font-bold text-[#0E1623] sm:h-[64px] sm:w-[108px]"
												style={{ background: PARCHMENT, border: `3px solid ${GOLD_ACCENT}` }}
											>
												<span className="text-lg sm:text-[32px]">{fmt(b.scores[key])}</span>
											</div>
										</div>
									</motion.li>
								))}
							</motion.ul>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function fmt(n: number) {
	return Number.isFinite(n) ? (Math.round(n * 100) / 100).toFixed(1) : "";
} 
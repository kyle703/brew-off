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
			<div className="px-6">
				<div
					className="relative rounded-[24px]"
					style={{
						background: NAVY_INK,
						boxShadow: "0 10px 24px rgba(14,22,35,0.25)",
						border: `2px solid ${GOLD_ACCENT}`,
					}}
				>
					<div className="rounded-[22px]" style={{ border: `2px solid ${NAVY_INK}` }}>
						<div className="pt-6 pb-8 px-6">
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
								className="mt-6 space-y-4"
							>
								{sorted.slice(0, 10).map((b, i) => (
									<motion.li key={b.entryId} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
										<div className="grid" style={{ gridTemplateColumns: "80px 1fr 120px" }}>
											{/* Medal */}
											<div className="flex items-center justify-center">
												<RankBadge rank={i + 1} size={56} />
											</div>

											{/* Parchment bar */}
											<div className="flex items-stretch font-fraktur ">
												<div className="flex-1 flex items-center rounded-[10px]" style={{ background: PARCHMENT, border: `2px solid ${GOLD_HAIRLINE}` }}>
													<div className="px-5 py-3 w-full grid" style={{ gridTemplateColumns: "220px 1fr" }}>
														<div className="text-[22px] leading-none text-[#0E1623]">
															<span className="opacity-80 mr-4 text-[22px] " >{b.brewer || "—"}</span>
															<div className="font-fraktur text-[36px] align-middle" title={b.name}>{b.name}</div>
														</div>
														<div className="flex items-center justify-end">
															<div className="flex items-center" style={{ width: 160 }}>
																<div style={{ width: 2, height: 44, background: GOLD_ACCENT }} />
																<div className="ml-5 flex items-center gap-2">
																	<span className="text-[20px] text-[#0E1623]" >ABV</span>
																	<span className="text-[20px] text-[#0E1623]" >{b.abv == null ? "—" : `${b.abv.toFixed(1).replace('.', ',')}%`}</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>

											{/* Score box */}
											<div className="flex items-center justify-center ml-8">
												<div className="h-[64px] w-[120px] rounded-[12px] flex items-center justify-center text-[#0E1623] font-bold" style={{ background: PARCHMENT, border: `3px solid ${GOLD_ACCENT}` }}>
													<span className="text-[32px]">{fmt(b.scores[key])}</span>
												</div>
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
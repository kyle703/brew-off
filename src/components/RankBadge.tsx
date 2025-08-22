import { motion, useReducedMotion } from "framer-motion";

export default function RankBadge({ rank, size = 30, className = "" }: { rank: number; size?: number; className?: string }) {
	const prefersReducedMotionRaw = useReducedMotion();
	const prefersReducedMotion = !!prefersReducedMotionRaw;
	if (rank <= 3) return <MedalSVG place={rank as 1 | 2 | 3} size={size} className={className} prefersReducedMotion={prefersReducedMotion} />;
	return (
		<motion.div
			initial={prefersReducedMotion ? undefined : { scale: 0.95, opacity: 0 }}
			animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
			className={`inline-flex items-center justify-center rounded-full bg-[#171922] text-[#E3B341] font-semibold border-2 border-[#E3B341] ${className}`}
			style={{ width: size, height: size, fontSize: 18, fontWeight: 16, fontFamily: "UnifrakturCook, UnifrakturMaguntia, serif" } }
			aria-label={`Rank ${rank}`}
		>
			{rank}
		</motion.div>
	);
}

function MedalSVG({ place, size, className = "", prefersReducedMotion }: { place: 1 | 2 | 3; size: number; className?: string; prefersReducedMotion: boolean }) {
	const colors = {
		1: { rim: "#D4AF37", fill: "#F6C453" },
		2: { rim: "#9EA7B3", fill: "#C9D1D9" },
		3: { rim: "#B87333", fill: "#D79A59" },
	} as const;
	const c = colors[place];
	return (
		<motion.div
			initial={prefersReducedMotion ? undefined : { scale: 0.95, opacity: 0, y: 6 }}
			animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
			className={className}
			style={{ width: size, height: size }}
			aria-label={`Rank ${place}`}
		>
			<svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
				<defs>
					<radialGradient id={`g${place}`} cx="50%" cy="50%" r="60%">
						<stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
						<stop offset="100%" stopColor={c.fill} />
					</radialGradient>
					<pattern id={`engrave${place}`} width="6" height="6" patternUnits="userSpaceOnUse">
						<path d="M0 3 L6 3" stroke="#000" strokeOpacity="0.05" strokeWidth="1" />
					</pattern>
				</defs>
				<circle cx="24" cy="24" r="22" fill={c.rim} />
				<circle cx="24" cy="24" r="18" fill={`url(#g${place})`} stroke="#00000022" />
				<circle cx="24" cy="24" r="16" fill={`url(#engrave${place})`} opacity="0.1" />
				<text x="24" y="29" textAnchor="middle" fontFamily="UnifrakturCook, UnifrakturMaguntia, serif" fontWeight={800} fontSize="16" fill="#1b1b1b">
					{place}
				</text>
			</svg>
		</motion.div>
	);
} 
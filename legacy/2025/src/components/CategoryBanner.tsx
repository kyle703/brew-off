import { motion, useReducedMotion } from "framer-motion";

type Props = {
	title: string;
	subtitle?: string;
	className?: string;
	showCrown?: boolean;
};

export default function CategoryBanner({ title, subtitle, className = "", showCrown = false }: Props) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<div className={`w-full flex flex-col items-center ${className}`}>
			<motion.div
				initial={prefersReducedMotion ? { opacity: 0 } : { y: -12, opacity: 0 }}
				animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
				transition={{ duration: 0.35, ease: "easeOut" }}
				className="relative flex items-center justify-center"
			>
				<svg viewBox="0 0 1200 260" className="w-[min(100%,1100px)] h-auto" aria-hidden style={{ scale: 1.5 }}>
					<defs>
						<linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%" stopColor="#E3B341" />
							<stop offset="100%" stopColor="#D49F27" />
						</linearGradient>
						<pattern id="diamondBand" width="36" height="36" patternUnits="userSpaceOnUse">
							<polygon points="18,0 36,18 18,36 0,18" fill="#0E1623" opacity="0.25" />
						</pattern>
					</defs>

					{/* Outer frame with scalloped corners */}
					<rect x="30" y="30" width="1140" height="200" rx="28" fill="#F3E9D2" stroke="url(#goldStroke)" strokeWidth="12" />
					<rect x="42" y="42" width="1116" height="176" rx="22" fill="none" stroke="#171922" strokeWidth="4" />

					{/* Diamond bands top/bottom */}
					<rect x="100" y="52" width="980" height="32" fill="url(#diamondBand)" />
					<rect x="110" y="164" width="980" height="32" fill="url(#diamondBand)" />

				</svg>

				{/* Title overlay */}
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<h2 className="font-fraktur text-5xl leading-none text-[#0E1623]">
						{title}
						{showCrown && <span className="ml-3" aria-hidden>👑</span>}
					</h2>
				</div>
			</motion.div>
			{subtitle && (
				<div className="mt-3">
					<div className="inline-flex items-center rounded-full bg-[#0E1623] text-[#AAB0C0] px-4 py-2 text-[13px] tracking-wider uppercase" style={{ letterSpacing: "0.06em" }}>
						{subtitle}
					</div>
				</div>
			)}
		</div>
	);
} 
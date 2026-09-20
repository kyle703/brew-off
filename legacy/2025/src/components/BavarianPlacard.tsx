export default function BavarianPlacard({ className = "" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 1200 220"
			className={`w-full h-auto ${className}`}
			aria-hidden
		>
			<defs>
				{/* Bavarian lozenge pattern - elongated diamonds like the example */}
				<pattern id="bavarianLozenge" width="72" height="96" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
					<rect width="72" height="96" fill="#0077B6" />
					<path d="M36 0L72 48L36 96L0 48Z" fill="#FFFFFF" />
				</pattern>
			</defs>

			{/* Gold outer border - hairline */}
			<rect x="10" y="30" width="1180" height="180" rx="20" fill="none" stroke="#E3B341" strokeWidth="2" />
			
			{/* Navy inner border - hairline */}
			<rect x="12" y="32" width="1176" height="176" rx="18" fill="none" stroke="#171922" strokeWidth="2" />
			
			{/* Bavarian pattern background - larger */}
			<rect x="14" y="34" width="1172" height="172" rx="16" fill="url(#bavarianLozenge)" />

			{/* Gold icon tile */}
			<rect x="40" y="60" width="100" height="100" rx="8" fill="#E3B341" stroke="#171922" strokeWidth="2" />

			{/* Cream center panel */}
			<rect x="160" y="60" width="1000" height="100" rx="8" fill="#F3E9D2" stroke="#171922" strokeWidth="2" />
		</svg>
	);
} 
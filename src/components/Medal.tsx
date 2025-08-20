type Props = { place: 1 | 2 | 3; size?: number };

export default function Medal({ place, size = 60 }: Props) {
  const colors = {
    1: { rim: "#D4AF37", fill: "#F6C453" },
    2: { rim: "#9EA7B3", fill: "#C9D1D9" },
    3: { rim: "#B87333", fill: "#D79A59" },
  } as const;
  const c = colors[place];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <radialGradient id={`g${place}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="100%" stopColor={c.fill} />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={c.rim} />
      <circle
        cx="24"
        cy="24"
        r="18"
        fill={`url(#g${place})`}
        stroke="#00000022"
      />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="Inter, system-ui"
        fontWeight={800}
        fontSize="16"
        fill="#1b1b1b"
      >
        {place}
      </text>
    </svg>
  );
}

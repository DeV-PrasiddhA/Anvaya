interface RouteMapProps {
  progressPct: number; // 0..100
  live: boolean;
  origin: string;
  destination: string;
}

/**
 * Lightweight inline route map — no external image dependency.
 * Topographic hill silhouettes + dashed route line, with origin / destination
 * markers and a live truck position that tracks `progressPct`.
 *
 * viewBox (1200x560) intentionally matches common card aspect ratios so the
 * SVG fills the container with `slice` without cropping the route.
 */
export default function RouteMap({
  progressPct,
  live,
  origin,
  destination,
}: RouteMapProps) {
  // Map 0..100 progress along the route arc
  const startX = 130;
  const endX = 1070;
  const startY = 350;
  const endY = 280;
  const t = progressPct / 100;
  const truckX = startX + (endX - startX) * t;
  const truckY = startY + (endY - startY) * t - 12;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      role="img"
      aria-label={`Route map from ${origin} to ${destination}`}
    >
      <svg
        viewBox="0 0 1200 560"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8f1e4" />
            <stop offset="60%" stopColor="#d4e4c8" />
            <stop offset="100%" stopColor="#b9d4a4" />
          </linearGradient>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a4d0b8" />
            <stop offset="100%" stopColor="#73db9a" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8cf5b2" />
            <stop offset="100%" stopColor="#a4d0b8" />
          </linearGradient>
          <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0edd3" />
            <stop offset="100%" stopColor="#8cf5b2" />
          </linearGradient>
          <linearGradient id="hill4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4e4c8" />
            <stop offset="100%" stopColor="#c0edd3" />
          </linearGradient>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#264e3c"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="1200" height="560" fill="url(#sky)" />
        <rect width="1200" height="560" fill="url(#grid)" />

        {/* Far hills (lightest) */}
        <path
          d="M0 200 Q 200 130 400 180 T 800 170 T 1200 190 L 1200 560 L 0 560 Z"
          fill="url(#hill4)"
          opacity="0.7"
        />
        <path
          d="M0 280 Q 200 220 400 260 T 800 250 T 1200 270 L 1200 560 L 0 560 Z"
          fill="url(#hill3)"
          opacity="0.75"
        />
        {/* Mid hills */}
        <path
          d="M0 360 Q 200 310 400 340 T 800 330 T 1200 350 L 1200 560 L 0 560 Z"
          fill="url(#hill2)"
          opacity="0.85"
        />
        {/* Front hills */}
        <path
          d="M0 430 Q 200 390 400 410 T 800 400 T 1200 420 L 1200 560 L 0 560 Z"
          fill="url(#hill1)"
        />

        {/* Lake */}
        <ellipse cx="820" cy="320" rx="90" ry="18" fill="#a4d0b8" opacity="0.7" />
        <ellipse cx="820" cy="318" rx="72" ry="11" fill="#73db9a" opacity="0.85" />

        {/* Route shadow */}
        <path
          d={`M ${startX} ${startY} C 280 280, 420 240, 600 260 S 920 250, ${endX} ${endY}`}
          fill="none"
          stroke="#002d1c"
          strokeOpacity="0.18"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Route line — Kathmandu (left) to Pokhara (right) */}
        <path
          d={`M ${startX} ${startY} C 280 280, 420 240, 600 260 S 920 250, ${endX} ${endY}`}
          fill="none"
          stroke="#006d3e"
          strokeWidth="3.5"
          strokeDasharray="10 7"
          strokeLinecap="round"
        />

        {/* Origin marker (Kathmandu) */}
        <g transform={`translate(${startX} ${startY})`}>
          <circle r="11" fill="#ffffff" stroke="#002d1c" strokeWidth="2.5" />
          <circle r="4" fill="#002d1c" />
          <rect
            x="-50"
            y="-42"
            width="100"
            height="24"
            rx="12"
            fill="#ffffff"
            stroke="#002d1c"
            strokeOpacity="0.18"
          />
          <text
            x="0"
            y="-25"
            textAnchor="middle"
            fontFamily="Inter"
            fontSize="13"
            fontWeight="700"
            fill="#002d1c"
          >
            {origin}
          </text>
        </g>

        {/* Destination marker (Pokhara) */}
        <g transform={`translate(${endX} ${endY})`}>
          <path
            d="M0 -24 C 8 -24 16 -17 16 -8 C 16 0 0 16 0 16 C 0 16 -16 0 -16 -8 C -16 -17 -8 -24 0 -24 Z"
            fill="#006d3e"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <circle r="5" cy="-8" fill="#ffffff" />
          <rect
            x="-52"
            y="24"
            width="104"
            height="24"
            rx="12"
            fill="#006d3e"
          />
          <text
            x="0"
            y="41"
            textAnchor="middle"
            fontFamily="Inter"
            fontSize="13"
            fontWeight="700"
            fill="#ffffff"
          >
            {destination}
          </text>
        </g>

        {/* Truck — animates along the route */}
        <g
          style={{
            transform: `translate(${truckX}px, ${truckY}px)`,
            transition: "transform 700ms ease-out",
          }}
        >
          <circle r="18" fill="#006d3e" opacity="0.3">
            {live && (
              <animate
                attributeName="r"
                values="14;24;14"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
            {live && (
              <animate
                attributeName="opacity"
                values="0.3;0.05;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <g transform="translate(-12 -12)">
            <circle r="12" fill="#006d3e" stroke="#ffffff" strokeWidth="2" />
            <path
              d="M-5 -3 L-1 -3 L-1 -6 L3 -6 L3 -3 L5 -3 L5 4 L-5 4 Z"
              fill="#ffffff"
            />
          </g>
        </g>

        {/* Subtle compass / scale at bottom-right */}
        <g transform="translate(1100 510)" opacity="0.55">
          <circle r="18" fill="#ffffff" stroke="#264e3c" strokeOpacity="0.4" />
          <path d="M0 -14 L4 0 L0 14 L-4 0 Z" fill="#006d3e" />
          <text
            x="0"
            y="-22"
            textAnchor="middle"
            fontFamily="Inter"
            fontSize="9"
            fontWeight="700"
            fill="#002d1c"
          >
            N
          </text>
        </g>
      </svg>
    </div>
  );
}

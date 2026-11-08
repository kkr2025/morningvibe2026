import React from 'react';

export default function TournamentLogo({ size = 120, animated = true, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Red & Gold Gradients */}
        <radialGradient id="shieldGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="60%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>

        <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="90%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <radialGradient id="ballGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#fef3c7" />
        </radialGradient>

        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>

        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="trophyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Golden Championship Ring */}
      <circle cx="100" cy="100" r="97" fill="url(#shieldGrad)" stroke="url(#goldRing)" strokeWidth="4" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="5 3" opacity="0.6" />

      {/* Sun rays / Gold burst behind ball */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + 46 * Math.cos(rad);
        const y1 = 100 + 46 * Math.sin(rad);
        const x2 = 100 + 69 * Math.cos(rad);
        const y2 = 100 + 69 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#sunGrad)"
            strokeWidth={i % 2 === 0 ? "3.2" : "1.8"}
            strokeLinecap="round"
            opacity={i % 2 === 0 ? "0.95" : "0.55"}
            filter="url(#goldGlow)"
          >
            {animated && (
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="16s"
                repeatCount="indefinite"
              />
            )}
          </line>
        );
      })}

      {/* Football body */}
      <circle cx="100" cy="100" r="38" fill="url(#ballGrad)" stroke="#d97706" strokeWidth="1.5" filter="url(#goldGlow)" />

      {/* Football pentagon patches in dark ruby & obsidian */}
      <polygon points="100,70 112,78 108,92 92,92 88,78" fill="#450a0a" opacity="0.9" />
      <polygon points="100,70 88,78 78,68 82,56 100,56" fill="#1e1b4b" opacity="0.8" />
      <polygon points="100,70 112,78 122,68 118,56 100,56" fill="#1e1b4b" opacity="0.8" />
      <polygon points="92,92 88,78 78,68 68,80 72,95" fill="#450a0a" opacity="0.75" />
      <polygon points="108,92 112,78 122,68 132,80 128,95" fill="#450a0a" opacity="0.75" />
      <polygon points="100,130 92,92 72,95 70,112 86,122" fill="#1e1b4b" opacity="0.75" />
      <polygon points="100,130 108,92 128,95 130,112 114,122" fill="#1e1b4b" opacity="0.75" />

      {/* Ball gold highlight shine */}
      <ellipse cx="88" cy="83" rx="9" ry="5.5" fill="#fef08a" opacity="0.5" transform="rotate(-25 88 83)" />

      {/* Top gold banner arc text path */}
      <path id="topArcGold" d="M 23,100 A 77,77 0 0,1 177,100" fill="none" />
      <text fontSize="13.5" fontWeight="900" fontFamily="'Outfit', sans-serif" fill="#fef08a" letterSpacing="2.5" filter="url(#goldGlow)">
        <textPath href="#topArcGold" startOffset="50%" textAnchor="middle">MORNING CUP</textPath>
      </text>

      {/* Bottom arc text path */}
      <path id="bottomArcGold" d="M 28,105 A 72,72 0 0,0 172,105" fill="none" />
      <text fontSize="10.5" fontWeight="800" fontFamily="'Outfit', sans-serif" fill="#fbbf24" letterSpacing="3">
        <textPath href="#bottomArcGold" startOffset="50%" textAnchor="middle">★ SEASON 6 ★</textPath>
      </text>

      {/* Gold Star decorations on sides */}
      <text x="18" y="108" fontSize="12" fill="#fbbf24" filter="url(#goldGlow)">★</text>
      <text x="170" y="108" fontSize="12" fill="#fbbf24" filter="url(#goldGlow)">★</text>

      {/* Animated pulsing outer gold halo */}
      {animated && (
        <circle cx="100" cy="100" r="96" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="r" values="94;99;94" dur="2.8s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

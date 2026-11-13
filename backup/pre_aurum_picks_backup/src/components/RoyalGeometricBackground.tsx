import React from 'react';

/**
 * Royal Geometric Background
 * Renders an authentic Ottoman/Royal 8-fold and 16-fold geometric star rosette
 * with dual counter-rotating layers and subtle gold radial aura.
 */
export const RoyalGeometricBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* Soft Center Gold Ambient Vignettes */}
      <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-b from-amber-500/10 via-yellow-600/5 to-transparent blur-3xl" />
      <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-gradient-to-t from-amber-500/8 via-amber-700/4 to-transparent blur-3xl" />

      {/* Primary Outer Rotating Geometric Mandala (Clockwise) */}
      <div className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] flex items-center justify-center">
        <div className="w-full h-full opacity-20 animate-spin-slow">
          <svg
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full stroke-amber-400"
          >
            {/* Outer Royal Border Rings */}
            <circle cx="300" cy="300" r="280" strokeWidth="1" strokeDasharray="4 8" opacity="0.6" />
            <circle cx="300" cy="300" r="265" strokeWidth="1.2" opacity="0.8" />
            <circle cx="300" cy="300" r="250" strokeWidth="0.8" strokeDasharray="8 6" opacity="0.5" />

            {/* 16-point Outer Geometric Star Pattern */}
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((angle, i) => (
              <g key={`outer-ray-${i}`} transform={`rotate(${angle} 300 300)`}>
                <line x1="300" y1="35" x2="300" y2="565" strokeWidth="0.75" opacity="0.4" />
                <line x1="35" y1="300" x2="565" y2="300" strokeWidth="0.75" opacity="0.4" />
                {/* Outer Diamond Points */}
                <polygon
                  points="300,45 315,80 300,115 285,80"
                  strokeWidth="1"
                  fill="rgba(212, 175, 55, 0.03)"
                  opacity="0.8"
                />
                <polygon
                  points="300,485 315,520 300,555 285,520"
                  strokeWidth="1"
                  fill="rgba(212, 175, 55, 0.03)"
                  opacity="0.8"
                />
              </g>
            ))}

            {/* Intersecting Concentric Royal Squares (8-Pointed Star Lattice) */}
            <rect
              x="110"
              y="110"
              width="380"
              height="380"
              strokeWidth="1.2"
              opacity="0.7"
              fill="none"
            />
            <rect
              x="110"
              y="110"
              width="380"
              height="380"
              transform="rotate(45 300 300)"
              strokeWidth="1.2"
              opacity="0.7"
              fill="none"
            />
            <rect
              x="145"
              y="145"
              width="310"
              height="310"
              transform="rotate(22.5 300 300)"
              strokeWidth="0.8"
              strokeDasharray="6 4"
              opacity="0.5"
              fill="none"
            />
            <rect
              x="145"
              y="145"
              width="310"
              height="310"
              transform="rotate(67.5 300 300)"
              strokeWidth="0.8"
              strokeDasharray="6 4"
              opacity="0.5"
              fill="none"
            />

            {/* Middle Concentric Circles with Royal Ticks */}
            <circle cx="300" cy="300" r="190" strokeWidth="1" opacity="0.8" />
            <circle cx="300" cy="300" r="140" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Secondary Inner Counter-Rotating Sacred Rosette (Counter-Clockwise) */}
      <div className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] flex items-center justify-center">
        <div className="w-full h-full opacity-25 animate-spin-reverse-slow">
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full stroke-yellow-300"
          >
            {/* Inner 8-Pointed Star (Rub el Hizb) */}
            <rect
              x="85"
              y="85"
              width="230"
              height="230"
              strokeWidth="1.5"
              opacity="0.9"
              fill="rgba(245, 158, 11, 0.04)"
            />
            <rect
              x="85"
              y="85"
              width="230"
              height="230"
              transform="rotate(45 200 200)"
              strokeWidth="1.5"
              opacity="0.9"
              fill="rgba(245, 158, 11, 0.04)"
            />

            {/* Golden Petals / Arabesque Geometry */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={`inner-petal-${i}`} transform={`rotate(${angle} 200 200)`}>
                <path
                  d="M 200 65 Q 225 120 200 150 Q 175 120 200 65 Z"
                  strokeWidth="1.2"
                  opacity="0.85"
                  fill="rgba(255, 215, 0, 0.05)"
                />
                <circle cx="200" cy="65" r="3.5" fill="#f59e0b" stroke="none" />
              </g>
            ))}

            {/* Central Imperial Medallion */}
            <circle cx="200" cy="200" r="60" strokeWidth="1.5" opacity="0.85" />
            <circle cx="200" cy="200" r="45" strokeWidth="1" strokeDasharray="2 4" opacity="0.7" />
            <circle cx="200" cy="200" r="28" strokeWidth="1.5" fill="rgba(212, 175, 55, 0.12)" />
            <circle cx="200" cy="200" r="8" fill="#fbbf24" stroke="none" />
          </svg>
        </div>
      </div>

      {/* Subtle Radial Gradient Vignette overlay so background fades seamlessly towards dark edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 32%, transparent 25%, rgba(9, 10, 16, 0.5) 60%, #090a10 100%)',
        }}
      />
    </div>
  );
};

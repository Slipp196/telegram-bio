import React, { useEffect, useRef } from 'react';

interface WinterSnowflakeProps {
  isPlaying?: boolean;
}

export const WinterSnowflake: React.FC<WinterSnowflakeProps> = ({
  isPlaying = false,
}) => {
  const snowflakeRef = useRef<HTMLDivElement | null>(null);
  const currentRotationRef = useRef(0);
  const ambientDirectionRef = useRef(1); // 1 = clockwise, -1 = counter-clockwise
  const wheelMomentumRef = useRef(0);

  useEffect(() => {
    let animId: number;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        // Scrolled DOWN: spin fast clockwise & switch ambient rotation to clockwise
        ambientDirectionRef.current = 1;
        wheelMomentumRef.current += Math.min(e.deltaY * 0.055, 3.5);
      } else if (e.deltaY < 0) {
        // Scrolled UP: spin fast counter-clockwise & switch ambient rotation to counter-clockwise
        ambientDirectionRef.current = -1;
        wheelMomentumRef.current += Math.max(e.deltaY * 0.055, -3.5);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    const animate = () => {
      // 1. Base gentle continuous ambient drift in current direction
      const baseDrift = ambientDirectionRef.current * 0.08;

      // 2. Smooth exponential decay of scroll momentum
      wheelMomentumRef.current *= 0.945;

      // 3. Advance total rotation smoothly
      currentRotationRef.current += baseDrift + wheelMomentumRef.current;

      if (snowflakeRef.current) {
        snowflakeRef.current.style.transform = `rotate(${currentRotationRef.current.toFixed(3)}deg) translateZ(0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute select-none overflow-visible will-change-[transform,opacity,filter] transition-all duration-1000 ease-in-out hidden md:block"
      style={{
        position: 'absolute',
        top: '50%',
        left: '52%',
        transform: isPlaying ? 'translate(-50%, -50%) scale(0.85)' : 'translate(-50%, -50%) scale(1)',
        opacity: isPlaying ? 0 : 1,
        filter: isPlaying ? 'blur(26px)' : 'blur(0px)',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {/* Ambient Frost Light Halos */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] lg:w-[950px] lg:h-[950px] rounded-full bg-white/[0.06] blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-white/10 blur-[100px] pointer-events-none" />

      {/* Rotating Snowflake Container */}
      <div
        ref={snowflakeRef}
        className="relative w-[960px] h-[960px] lg:w-[1180px] lg:h-[1180px] will-change-transform origin-center"
      >
        <svg
          viewBox="-500 -500 1000 1000"
          className="w-full h-full filter drop-shadow-[0_0_18px_rgba(255,255,255,0.5)] drop-shadow-[0_0_45px_rgba(255,255,255,0.25)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ice Glow Filter */}
            <filter id="ice-glow-refined" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear Gradient for realistic ice needles */}
            <linearGradient id="iceSpine" x1="0" y1="0" x2="0" y2="-480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.55" />
            </linearGradient>

            {/* Single 60-degree sector of an authentic stellar dendrite snowflake */}
            <g id="master-dendrite-branch">
              {/* Central Spine with beveled double edge */}
              <line x1="0" y1="0" x2="0" y2="-480" stroke="url(#iceSpine)" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="-1.5" y1="-30" x2="-1.5" y2="-460" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" strokeLinecap="round" />
              <line x1="1.5" y1="-30" x2="1.5" y2="-460" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" strokeLinecap="round" />

              {/* Spearhead Crystal Tip at -480 */}
              <path
                d="M 0 -495 L 16 -468 L 0 -456 L -16 -468 Z"
                fill="rgba(255,255,255,0.15)"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <line x1="0" y1="-495" x2="0" y2="-456" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.9" />

              {/* Sub-spear spurs at -440 */}
              <path d="M 0 -440 L 22 -454 M 0 -440 L -22 -454" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 14 -449 L 22 -443 M -14 -449 L -22 -443" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.75" />
              <circle cx="22" cy="-454" r="1.5" fill="#ffffff" />
              <circle cx="-22" cy="-454" r="1.5" fill="#ffffff" />

              {/* Tier 4 (Outer Major Dendrite Chevron at -375) */}
              <g transform="translate(0, -375)">
                {/* Right branch */}
                <path d="M 0 0 L 80 -46" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M 32 -18.5 L 46 -7 M 55 -31.7 L 70 -19.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.85" />
                <path d="M 32 -18.5 L 36 -32 M 55 -31.7 L 60 -45" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
                {/* Micro fern barbs */}
                <path d="M 40 -12 L 46 -18 M 62 -25 L 68 -32" stroke="#ffffff" strokeWidth="1.0" strokeLinecap="round" strokeOpacity="0.6" />
                {/* Outer diamond tip */}
                <polygon points="80,-46 90,-51 86,-40" fill="rgba(255,255,255,0.8)" stroke="#ffffff" strokeWidth="1" />

                {/* Left branch (mirror) */}
                <path d="M 0 0 L -80 -46" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M -32 -18.5 L -46 -7 M -55 -31.7 L -70 -19.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.85" />
                <path d="M -32 -18.5 L -36 -32 M -55 -31.7 L -60 -45" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />
                <path d="M -40 -12 L -46 -18 M -62 -25 L -68 -32" stroke="#ffffff" strokeWidth="1.0" strokeLinecap="round" strokeOpacity="0.6" />
                <polygon points="-80,-46 -90,-51 -86,-40" fill="rgba(255,255,255,0.8)" stroke="#ffffff" strokeWidth="1" />
              </g>

              {/* Tier 3 (Main Broad Dendrite Chevron at -285) */}
              <g transform="translate(0, -285)">
                {/* Right primary chevron arm */}
                <path d="M 0 0 L 125 -72.2" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
                {/* Secondary side-needles */}
                <path d="M 38 -22 L 58 -8 M 72 -41.6 L 92 -26 M 98 -56.6 L 115 -42" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                {/* Tertiary sub-twigs */}
                <path d="M 50 -12 L 58 -21 M 82 -32 L 90 -41" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
                {/* Counter side-twigs */}
                <path d="M 38 -22 L 44 -38 M 72 -41.6 L 78 -58 M 98 -56.6 L 104 -70" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.7" />
                {/* Prismatic facets along the branch */}
                <polygon points="125,-72.2 136,-78 132,-66" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
                <circle cx="125" cy="-72.2" r="2.2" fill="#ffffff" />

                {/* Left primary chevron arm (mirror) */}
                <path d="M 0 0 L -125 -72.2" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M -38 -22 L -58 -8 M -72 -41.6 L -92 -26 M -98 -56.6 L -115 -42" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M -50 -12 L -58 -21 M -82 -32 L -90 -41" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
                <path d="M -38 -22 L -44 -38 M -72 -41.6 L -78 -58 M -98 -56.6 L -104 -70" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.7" />
                <polygon points="-125,-72.2 -136,-78 -132,-66" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
                <circle cx="-125" cy="-72.2" r="2.2" fill="#ffffff" />
              </g>

              {/* Tier 2 (Inner Broad Chevron at -190) */}
              <g transform="translate(0, -190)">
                <path d="M 0 0 L 105 -60.6" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M 35 -20.2 L 54 -7 M 70 -40.4 L 88 -26" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M 35 -20.2 L 40 -35 M 70 -40.4 L 75 -54" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.75" />

                <path d="M 0 0 L -105 -60.6" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M -35 -20.2 L -54 -7 M -70 -40.4 L -88 -26" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M -35 -20.2 L -40 -35 M -70 -40.4 L -75 -54" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.75" />
              </g>

              {/* Hexagonal Facet Plate at -115 */}
              <path
                d="M 0 -128 L 30 -111 L 0 -94 L -30 -111 Z"
                fill="rgba(255,255,255,0.08)"
                stroke="#ffffff"
                strokeWidth="1.6"
              />
              <line x1="0" y1="-128" x2="0" y2="-94" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="-30" y1="-111" x2="30" y2="-111" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />

              {/* Tier 1 (Small Basal Chevron at -105) */}
              <path d="M 0 -105 L 50 -76 M 0 -105 L -50 -76" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <path d="M 28 -90 L 38 -82 M -28 -90 L -38 -82" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.75" />
            </g>
          </defs>

          {/* Repeat 6 dendritic branches at 0, 60, 120, 180, 240, 300 degrees */}
          <g filter="url(#ice-glow-refined)">
            <use href="#master-dendrite-branch" transform="rotate(0)" />
            <use href="#master-dendrite-branch" transform="rotate(60)" />
            <use href="#master-dendrite-branch" transform="rotate(120)" />
            <use href="#master-dendrite-branch" transform="rotate(180)" />
            <use href="#master-dendrite-branch" transform="rotate(240)" />
            <use href="#master-dendrite-branch" transform="rotate(300)" />
          </g>

          {/* Hexagonal Filigree Lattices Connecting Main Branches */}
          <g stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.5" fill="none">
            {/* Inner Hexagon Ring */}
            <polygon points="0,-110 95.26,-55 95.26,55 0,110 -95.26,55 -95.26,-55" />
            {/* Secondary Hexagon Lattice Web */}
            <polygon
              points="0,-195 168.87,-97.5 168.87,97.5 0,195 -168.87,97.5 -168.87,-97.5"
              strokeOpacity="0.35"
              strokeDasharray="4 4"
            />
            {/* Outer Tertiary Delicate Ring */}
            <polygon
              points="0,-290 251.15,-145 251.15,145 0,290 -251.15,145 -251.15,-145"
              strokeOpacity="0.25"
              strokeDasharray="3 5"
            />
          </g>

          {/* Majestic Central Hexagonal Star Core */}
          <g fill="none">
            {/* Outer Central Faceted Hexagon */}
            <polygon
              points="0,-72 62.35,-36 62.35,36 0,72 -62.35,36 -62.35,-36"
              stroke="#ffffff"
              strokeWidth="2.2"
              fill="rgba(255,255,255,0.08)"
            />
            {/* Inverted Hexagon forming 12-pointed faceted star */}
            <polygon
              points="62.35,0 31.18,54 -31.18,54 -62.35,0 -31.18,-54 31.18,-54"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeOpacity="0.75"
              fill="rgba(255,255,255,0.04)"
            />
            {/* Double nested core stars */}
            <polygon points="0,-52 45.03,26 -45.03,26" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.85" />
            <polygon points="0,52 45.03,-26 -45.03,-26" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.85" />

            {/* Central Diamond Facet & Radiant Star */}
            <circle cx="0" cy="0" r="16" stroke="#ffffff" strokeWidth="2" fill="rgba(255,255,255,0.25)" />
            <circle cx="0" cy="0" r="5" fill="#ffffff" />
            <polygon points="0,-12 3.5,0 0,12 -3.5,0" fill="#ffffff" />
            <polygon points="-12,0 0,3.5 12,0 0,-3.5" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </div>
  );
};

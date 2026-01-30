import React from 'react';

interface TrackPrepLogoProps {
  size?: number;
  className?: string;
}

const TrackPrepLogo: React.FC<TrackPrepLogoProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bottom layer - muted teal */}
      <path
        d="M12 42C12 42 16 28 32 28C48 28 52 42 52 42C52 42 48 50 32 50C16 50 12 42 12 42Z"
        fill="#7DD3C0"
        opacity="0.9"
      />
      
      {/* Middle layer - pastel blue */}
      <path
        d="M16 38C16 38 20 26 32 26C44 26 48 38 48 38C48 38 44 44 32 44C20 44 16 38 16 38Z"
        fill="#93C5FD"
        opacity="0.85"
      />
      
      {/* Top layer - soft lavender */}
      <path
        d="M20 34C20 34 24 24 32 24C40 24 44 34 44 34C44 34 40 38 32 38C24 38 20 34 20 34Z"
        fill="#C4B5FD"
        opacity="0.9"
      />
      
      {/* Subtle upward arrow */}
      <path
        d="M32 12L38 20H34V28H30V20H26L32 12Z"
        fill="#A78BFA"
        opacity="0.95"
      />
    </svg>
  );
};

export default TrackPrepLogo;

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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Shield gradient - Blue to Teal */}
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="50%" stopColor="#26A69A" />
          <stop offset="100%" stopColor="#43A047" />
        </linearGradient>
        
        {/* Road gradient */}
        <linearGradient id="roadGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#1E88E5" />
        </linearGradient>
        
        {/* Arrow gradient - Teal to Green */}
        <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#26A69A" />
          <stop offset="100%" stopColor="#43A047" />
        </linearGradient>
        
        {/* Bar gradients */}
        <linearGradient id="bar1Gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#42A5F5" />
        </linearGradient>
        <linearGradient id="bar2Gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#26A69A" />
          <stop offset="100%" stopColor="#4DB6AC" />
        </linearGradient>
        <linearGradient id="bar3Gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#43A047" />
          <stop offset="100%" stopColor="#66BB6A" />
        </linearGradient>
      </defs>
      
      {/* Shield outer shape */}
      <path
        d="M50 8C30 8 15 18 15 18V55C15 55 15 75 50 92C85 75 85 55 85 55V18C85 18 70 8 50 8Z"
        fill="url(#shieldGradient)"
        opacity="0.15"
      />
      
      {/* Shield border */}
      <path
        d="M50 12C32 12 18 21 18 21V54C18 54 18 72 50 88C82 72 82 54 82 54V21C82 21 68 12 50 12Z"
        fill="none"
        stroke="url(#shieldGradient)"
        strokeWidth="2.5"
        opacity="0.9"
      />
      
      {/* Road/path curve */}
      <path
        d="M20 70C20 70 28 55 38 48C48 41 55 35 55 35"
        fill="none"
        stroke="url(#roadGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      
      {/* Road center line */}
      <path
        d="M24 66C24 66 30 55 38 50"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 4"
        opacity="0.6"
      />
      
      {/* Progress bars */}
      <rect x="42" y="52" width="6" height="16" rx="2" fill="url(#bar1Gradient)" />
      <rect x="52" y="44" width="6" height="24" rx="2" fill="url(#bar2Gradient)" />
      <rect x="62" y="36" width="6" height="32" rx="2" fill="url(#bar3Gradient)" />
      
      {/* Upward arrow */}
      <path
        d="M65 22L65 38M65 22L58 29M65 22L72 29"
        stroke="url(#arrowGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Achievement stars */}
      <circle cx="28" cy="28" r="2" fill="#FFD54F" opacity="0.9" />
      <circle cx="75" cy="18" r="1.5" fill="#FFD54F" opacity="0.8" />
      <circle cx="22" cy="42" r="1.5" fill="#FFD54F" opacity="0.7" />
    </svg>
  );
};

export default TrackPrepLogo;

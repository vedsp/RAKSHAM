'use client';

export default function RakshamLogo({ className = "w-10 h-10", color = "currentColor" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer Shield Outline */}
      <path 
        d="M 18,15 L 82,15 L 82,60 C 82,75 50,92 50,92 C 50,92 18,75 18,60 Z" 
        stroke={color} 
        strokeWidth="9" 
        strokeLinejoin="miter"
        fill="none"
      />
      {/* Inner Devanagari 'र' / 'R' Styled Path */}
      <path 
        d="M 28,30 L 70,30 C 70,30 70,48 56,48 L 42,48 C 38,48 38,58 45,62 L 68,78" 
        stroke={color} 
        strokeWidth="9" 
        strokeLinecap="square" 
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  );
}

import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Music Universe Logo"
  >
    <defs>
      {/* 3D Sphere Gradient - Creates a solid round planet look */}
      <radialGradient id="planet3D" cx="35%" cy="35%" r="60%" fx="30%" fy="30%">
        <stop offset="0%" stopColor="#a78bfa" /> {/* Highlight */}
        <stop offset="40%" stopColor="#7c3aed" /> {/* Midtone */}
        <stop offset="100%" stopColor="#4c1d95" /> {/* Shadow */}
      </radialGradient>
      
      {/* Glow filter for the frequency ring */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Planet Body (Solid 3D Sphere) */}
    <circle cx="50" cy="50" r="22" fill="url(#planet3D)" />
    
    {/* Frequency Ring - Layer 1: Base Glow */}
    <ellipse 
      cx="50" 
      cy="50" 
      rx="34" 
      ry="10" 
      stroke="#8b5cf6" 
      strokeWidth="1" 
      transform="rotate(-20 50 50)" 
      className="opacity-40"
    />
    
    {/* Frequency Ring - Layer 2: Soundwave Dashes (Glowing) */}
    <ellipse 
      cx="50" 
      cy="50" 
      rx="34" 
      ry="10" 
      stroke="#e879f9" 
      strokeWidth="2" 
      strokeDasharray="2 4" 
      strokeLinecap="round"
      transform="rotate(-20 50 50)" 
      filter="url(#glow)"
      className="animate-pulse"
    />

    {/* Floating Sparkle (Bouncing Animation - Kept as requested) */}
    <path 
      d="M75 20 L78 12 L81 20 L89 23 L81 26 L78 34 L75 26 L67 23 L75 20 Z" 
      fill="#fbbf24" 
      className="animate-bounce"
      style={{ animationDuration: '2s' }} 
    />
    
    {/* Small decorative star */}
    <path d="M20 25 L21 23 L22 25 L24 25.5 L22 26 L21 28 L20 26 L18 25.5 Z" fill="#60a5fa" className="animate-pulse" opacity="0.7" />
  </svg>
);

export default Logo;

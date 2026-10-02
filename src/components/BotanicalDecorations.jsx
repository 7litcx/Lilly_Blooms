import React from 'react';

/**
 * Botanical line-art flourishes matching the hand-drawn floral aesthetics in the design
 */
export const BotanicalBranch = ({ className = "w-32 h-32 text-rose-300/70" }) => (
  <svg 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Main Stem */}
    <path d="M20 180 C 50 140, 80 110, 140 50 C 160 30, 180 20, 190 15" />
    
    {/* Leaves & Buds */}
    <path d="M60 140 C 50 120, 45 110, 55 95 C 65 110, 65 125, 60 140 Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M85 115 C 95 95, 110 90, 120 100 C 110 115, 95 120, 85 115 Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M110 85 C 95 70, 95 55, 110 45 C 120 60, 115 75, 110 85 Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M140 55 C 150 40, 165 40, 170 50 C 160 65, 148 65, 140 55 Z" fill="currentColor" fillOpacity="0.08" />
    
    {/* Delicate secondary branch */}
    <path d="M85 115 C 100 130, 120 140, 145 145" />
    <path d="M115 130 C 125 120, 138 122, 142 130 C 132 138, 122 135, 115 130 Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M145 145 C 158 140, 168 148, 165 158 C 152 158, 148 152, 145 145 Z" fill="currentColor" fillOpacity="0.08" />

    {/* Tender little buds */}
    <circle cx="190" cy="15" r="2.5" fill="currentColor" />
    <circle cx="170" cy="50" r="1.5" fill="currentColor" />
  </svg>
);

export const SectionSprig = ({ className = "w-6 h-6 text-rose-400" }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor" 
    strokeWidth="1.3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M5 35 C 15 25, 22 18, 35 5" />
    <path d="M14 26 C 10 22, 9 17, 14 14 C 18 17, 17 22, 14 26 Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M23 17 C 26 12, 31 11, 33 15 C 30 19, 25 19, 23 17 Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M28 12 C 27 7, 29 4, 34 5 C 35 9, 32 12, 28 12 Z" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

export const StoryBotanicalFlourish = ({ className = "w-36 h-36 text-rose-300/80" }) => (
  <svg 
    viewBox="0 0 150 150" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M130 140 C 110 90, 80 50, 20 20" />
    <path d="M100 100 C 120 90, 130 95, 125 110 C 110 115, 102 108, 100 100 Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M70 65 C 60 45, 65 35, 80 40 C 80 55, 75 62, 70 65 Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M45 40 C 35 25, 40 15, 55 18 C 55 30, 48 38, 45 40 Z" fill="currentColor" fillOpacity="0.08" />
    <path d="M20 20 C 15 10, 22 5, 28 8 C 28 16, 24 20, 20 20 Z" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

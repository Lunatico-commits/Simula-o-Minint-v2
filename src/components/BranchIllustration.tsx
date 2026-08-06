import React from 'react';
import { MININTBranch } from '../types';

interface BranchIllustrationProps {
  branch: MININTBranch;
  size?: number;
  className?: string;
}

export const BranchIllustration: React.FC<BranchIllustrationProps> = ({
  branch,
  size = 36,
  className = '',
}) => {
  switch (branch) {
    case 'PNA':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md ${className}`}
        >
          {/* PNA - Shield & Gold Police Star */}
          <path
            d="M24 4L40 10V22C40 32.5 33.1 41.8 24 44C14.9 41.8 8 32.5 8 22V10L24 4Z"
            fill="url(#pnaBlueGrad)"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          {/* Gold Star */}
          <path
            d="M24 13L26.8 19.5L33.5 20.2L28.4 24.8L29.9 31.5L24 28L18.1 31.5L19.6 24.8L14.5 20.2L21.2 19.5L24 13Z"
            fill="#fbbf24"
            stroke="#d97706"
            strokeWidth="0.8"
          />
          {/* Central Blue Core */}
          <circle cx="24" cy="23" r="3" fill="#1e3a8a" stroke="#fef08a" strokeWidth="0.8" />
          <defs>
            <linearGradient id="pnaBlueGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e40af" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'SIC':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md ${className}`}
        >
          {/* SIC - Dark Tactical Shield & Investigation Badge */}
          <path
            d="M24 4L40 10V22C40 32.5 33.1 41.8 24 44C14.9 41.8 8 32.5 8 22V10L24 4Z"
            fill="url(#sicSteelGrad)"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {/* Detective Magnifying Glass / Badge */}
          <circle cx="21" cy="21" r="8" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          <path d="M27 27L35 35" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="21" cy="21" r="3" fill="#38bdf8" fillOpacity="0.6" />
          <defs>
            <linearGradient id="sicSteelGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#334155" />
              <stop offset="1" stopColor="#020617" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'SME':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md ${className}`}
        >
          {/* SME - Emerald Border Passport & Security Shield */}
          <path
            d="M24 4L40 10V22C40 32.5 33.1 41.8 24 44C14.9 41.8 8 32.5 8 22V10L24 4Z"
            fill="url(#smeGreenGrad)"
            stroke="#10b981"
            strokeWidth="2"
          />
          {/* Globe & Passport Seal */}
          <circle cx="24" cy="22" r="9" fill="none" stroke="#6ee7b7" strokeWidth="2" />
          <ellipse cx="24" cy="22" rx="4" ry="9" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
          <path d="M15 22H33" stroke="#6ee7b7" strokeWidth="1.5" />
          <path d="M17 17H31" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="1 1" />
          <path d="M17 27H31" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="1 1" />
          <defs>
            <linearGradient id="smeGreenGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#065f46" />
              <stop offset="1" stopColor="#022c22" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'SP':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md ${className}`}
        >
          {/* SP - Crimson Wine Shield & Scales of Justice / Lock */}
          <path
            d="M24 4L40 10V22C40 32.5 33.1 41.8 24 44C14.9 41.8 8 32.5 8 22V10L24 4Z"
            fill="url(#spWineGrad)"
            stroke="#f43f5e"
            strokeWidth="2"
          />
          {/* Scale of Justice & Keyhole */}
          <path d="M24 14V30M16 18H32M16 18L13 25M32 18L35 25" stroke="#fda4af" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 25C10 26.6 13 26.6 13 25M32 25C32 26.6 35 26.6 35 25" stroke="#fda4af" strokeWidth="1.8" />
          <path d="M20 30H28" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="spWineGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#831843" />
              <stop offset="1" stopColor="#4c0519" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'SPCB':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`drop-shadow-md ${className}`}
        >
          {/* SPCB - Fire Red Shield & Flame Helmet */}
          <path
            d="M24 4L40 10V22C40 32.5 33.1 41.8 24 44C14.9 41.8 8 32.5 8 22V10L24 4Z"
            fill="url(#spcbFireGrad)"
            stroke="#ef4444"
            strokeWidth="2"
          />
          {/* Protection Flame */}
          <path
            d="M24 13C24 13 29 18 29 23C29 26.3 26.8 29 24 29C21.2 29 19 26.3 19 23C19 20 21 17 24 13Z"
            fill="#f97316"
            stroke="#fef08a"
            strokeWidth="1"
          />
          <path
            d="M24 19C24 19 26.5 22 26.5 24.5C26.5 26 25.4 27 24 27C22.6 27 21.5 26 21.5 24.5C21.5 23 22.5 21 24 19Z"
            fill="#facc15"
          />
          <defs>
            <linearGradient id="spcbFireGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#991b1b" />
              <stop offset="1" stopColor="#450a0a" />
            </linearGradient>
          </defs>
        </svg>
      );

    default:
      return null;
  }
};

import React, { useState } from 'react';
import { MININTBranch } from '../types';
import { getAvatarImagePath, getUserGender, normalizeUniformId } from '../data/avatars';

export interface TacticalAvatarIllustrationProps {
  id: string;
  branch?: MININTBranch;
  gender?: 'male' | 'female';
  size?: number | string;
  className?: string;
  isAnimated?: boolean;
}

export const TacticalAvatarIllustration: React.FC<TacticalAvatarIllustrationProps> = ({
  id,
  branch = 'PNA',
  gender,
  size = '100%',
  className = '',
  isAnimated = false,
}) => {
  const resolvedGender = gender || getUserGender(id);
  const initialAssetPath = getAvatarImagePath(id, resolvedGender, branch);

  const [imgSrc, setImgSrc] = useState<string | undefined>(initialAssetPath);
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgSrc(initialAssetPath);
    setImgError(false);
  }, [initialAssetPath, id, resolvedGender]);

  const width = typeof size === 'number' ? `${size}px` : size;
  const height = typeof size === 'number' ? `${size}px` : size;

  const handleImageError = () => {
    const rawOrgan = (branch || id?.split('_')[0] || 'pna').toLowerCase();
    const cleanOrgan = ['pna', 'sic', 'sme', 'spcb', 'sp'].includes(rawOrgan) ? rawOrgan : 'pna';
    
    // If female version failed, try base organ female avatar first
    if (resolvedGender === 'female' && imgSrc !== `/avatars/${cleanOrgan}_female.png`) {
      setImgSrc(`/avatars/${cleanOrgan}_female.png`);
      return;
    }
    // Then try male uniform or base organ male avatar
    const maleAsset = getAvatarImagePath(id, 'male', branch);
    if (imgSrc !== maleAsset && imgSrc !== `/avatars/${cleanOrgan}_male.png`) {
      setImgSrc(maleAsset);
      return;
    }
    if (imgSrc !== `/avatars/${cleanOrgan}_male.png`) {
      setImgSrc(`/avatars/${cleanOrgan}_male.png`);
      return;
    }
    setImgError(true);
  };

  // If this is one of the 10 Base Avatars or a Shop Uniform with a direct image asset, render the asset directly
  if (imgSrc && !imgError) {
    return (
      <div
        style={{ width, height }}
        className={`relative overflow-hidden flex items-center justify-center select-none ${className}`}
      >
        <img
          src={imgSrc}
          alt={id}
          className="w-full h-full object-cover select-none pointer-events-none"
          onError={handleImageError}
        />
      </div>
    );
  }

  // Render SVG based on id
  switch (id) {
    // ==========================================
    // 💂‍♂️ 1. PNA PIR TACTICAL / PNA MALE
    // ==========================================
    case 'pna_pir':
    case 'pna_pir_tactical':
    case 'pna_male':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pirBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#020617" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id="pirArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="50%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="pirBeretGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <filter id="pirGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Pod Shield */}
          <rect width="128" height="128" rx="28" fill="url(#pirBgGrad)" />
          <circle cx="64" cy="64" r="58" stroke="#dc2626" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 4" />

          {/* Tactical Aura Glow */}
          <circle cx="64" cy="52" r="32" fill="#ef4444" fillOpacity="0.15" filter="url(#pirGlow)" />

          {/* Shoulder & Trapezius muscles / Outer Vest */}
          <path d="M18 116 C22 92, 38 82, 64 82 C90 82, 106 92, 110 116 Z" fill="url(#pirArmorGrad)" stroke="#3f3f46" strokeWidth="2" />
          
          {/* Tactical Ballistic Plate with MOLLE Webbing */}
          <path d="M34 88 L94 88 L88 120 L40 120 Z" fill="#09090b" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="38" y1="96" x2="90" y2="96" stroke="#52525b" strokeWidth="2" strokeDasharray="8 4" />
          <line x1="42" y1="104" x2="86" y2="104" stroke="#52525b" strokeWidth="2" strokeDasharray="8 4" />
          <line x1="44" y1="112" x2="84" y2="112" stroke="#52525b" strokeWidth="2" strokeDasharray="8 4" />

          {/* PIR Red Arm Band */}
          <rect x="20" y="98" width="10" height="18" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          <rect x="98" y="98" width="10" height="18" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />

          {/* Neck / Tactical Balaclava */}
          <path d="M50 68 L78 68 L80 84 L48 84 Z" fill="#18181b" stroke="#27272a" strokeWidth="1.5" />

          {/* Head & Face Silhouette */}
          <ellipse cx="64" cy="56" rx="20" ry="24" fill="#27272a" />
          <path d="M46 54 C48 68, 80 68, 82 54 Z" fill="#18181b" />

          {/* Tactical Goggles / Visor Reflection */}
          <rect x="48" y="48" width="32" height="11" rx="4" fill="#020617" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="52" y1="51" x2="62" y2="51" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="66" y1="51" x2="76" y2="51" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round" />

          {/* Official Red Beret (Tilted to right) */}
          <path d="M42 42 C40 24, 76 18, 92 28 C98 34, 96 46, 84 46 C74 46, 50 44, 42 42 Z" fill="url(#pirBeretGrad)" stroke="#991b1b" strokeWidth="2" />
          <path d="M42 42 C44 46, 84 48, 84 46" stroke="#450a0a" strokeWidth="2.5" />

          {/* Gold PIR Police Badge on Beret */}
          <polygon points="56,32 58,37 63,38 59,41 60,46 56,43 52,46 53,41 49,38 54,37" fill="url(#goldPlate)" stroke="#b45309" strokeWidth="0.8" />
          <circle cx="56" cy="39" r="2.5" fill="#1e3a8a" />

          {/* Tactical Comms Boom Mic */}
          <path d="M78 54 Q86 64, 70 70" stroke="#09090b" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="68" cy="70" r="3" fill="#ef4444" filter="url(#pirGlow)" />

          {/* Badge Label */}
          <rect x="44" y="100" width="40" height="14" rx="4" fill="#09090b" stroke="url(#goldPlate)" strokeWidth="1.2" />
          <text x="64" y="110" fill="#fef08a" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="monospace">PIR ELITE</text>
        </svg>
      );

    // ==========================================
    // 🦅 2. PNA GALA / PNA FEMALE (Comando de Honra)
    // ==========================================
    case 'pna_gala':
    case 'pna_female':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="galaBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="tunicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="50%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
            <linearGradient id="goldLux" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            <filter id="goldGleam" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Shield */}
          <rect width="128" height="128" rx="28" fill="url(#galaBg)" />
          <circle cx="64" cy="64" r="58" stroke="url(#goldLux)" strokeWidth="1.5" strokeOpacity="0.6" />

          {/* Royal Navy Tunic Bust */}
          <path d="M16 116 C20 86, 38 78, 64 78 C90 78, 108 86, 112 116 Z" fill="url(#tunicGrad)" stroke="url(#goldLux)" strokeWidth="1.8" />

          {/* Red and Gold Ceremonial Sash */}
          <path d="M34 82 L98 120 L84 120 L24 86 Z" fill="#b91c1c" />
          <path d="M36 83 L96 118" stroke="url(#goldLux)" strokeWidth="2" />

          {/* Braided Gold Epaulettes (Dragonas de Comando) */}
          {/* Left Epaulette */}
          <ellipse cx="28" cy="84" rx="14" ry="7" fill="url(#goldLux)" stroke="#78350f" strokeWidth="1" filter="url(#goldGleam)" />
          <circle cx="28" cy="84" r="2.5" fill="#ffffff" />
          {/* Right Epaulette */}
          <ellipse cx="100" cy="84" rx="14" ry="7" fill="url(#goldLux)" stroke="#78350f" strokeWidth="1" filter="url(#goldGleam)" />
          <circle cx="100" cy="84" r="2.5" fill="#ffffff" />

          {/* Standing Mandarin Collar with Gold Oak Leaves */}
          <path d="M48 66 L80 66 L82 78 L46 78 Z" fill="#172554" stroke="url(#goldLux)" strokeWidth="1.5" />
          <path d="M52 72 Q64 76, 76 72" stroke="url(#goldLux)" strokeWidth="1.8" fill="none" />

          {/* Officer Head */}
          <ellipse cx="64" cy="52" rx="18" ry="22" fill="#334155" />

          {/* Police Peak Cap (Quico de Gala) */}
          <path d="M38 38 C38 20, 90 20, 90 38 L94 44 L34 44 Z" fill="#1e3a8a" stroke="url(#goldLux)" strokeWidth="1.8" />
          <path d="M32 44 C42 47, 86 47, 96 44 L92 48 C82 51, 46 51, 36 48 Z" fill="#09090b" stroke="url(#goldLux)" strokeWidth="1" />

          {/* Golden Cap Oakleaves & Star Crest */}
          <polygon points="64,24 66,29 71,30 67,33 68,38 64,35 60,38 61,33 57,30 62,29" fill="url(#goldLux)" stroke="#78350f" strokeWidth="0.8" filter="url(#goldGleam)" />
          <path d="M48 38 Q64 42, 80 38" stroke="url(#goldLux)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Double Breasted Polished Gold Buttons */}
          <circle cx="56" cy="92" r="3" fill="url(#goldLux)" stroke="#78350f" strokeWidth="0.8" />
          <circle cx="72" cy="92" r="3" fill="url(#goldLux)" stroke="#78350f" strokeWidth="0.8" />
          <circle cx="56" cy="104" r="3" fill="url(#goldLux)" stroke="#78350f" strokeWidth="0.8" />
          <circle cx="72" cy="104" r="3" fill="url(#goldLux)" stroke="#78350f" strokeWidth="0.8" />

          {/* Golden Aguillettes (Cordões de Honra) */}
          <path d="M96 86 C88 98, 76 102, 66 98" stroke="url(#goldLux)" strokeWidth="2" fill="none" strokeDasharray="4 2" />
        </svg>
      );

    // ==========================================
    // 🔬 3. SIC FORENSIC EXPERT / SIC FEMALE (Perito Forense)
    // ==========================================
    case 'sic_forensic':
    case 'sic_forensic_expert':
    case 'sic_perito':
    case 'sic_female':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="forensicBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#083344" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="labCoat" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
            <filter id="cyanGleam" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Container */}
          <rect width="128" height="128" rx="28" fill="url(#forensicBg)" />
          <circle cx="64" cy="64" r="58" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="8 4" />

          {/* Lab Coat / Forensic Hazmat Vest */}
          <path d="M18 116 C22 90, 38 80, 64 80 C90 80, 106 90, 110 116 Z" fill="url(#labCoat)" stroke="#cbd5e1" strokeWidth="2" />
          
          {/* Inner Cyan Scrubber / Shirt */}
          <path d="M52 80 L76 80 L80 116 L48 116 Z" fill="#0f172a" stroke="url(#cyanNeon)" strokeWidth="1.5" />

          {/* SIC Metallic Badge with Hologram */}
          <rect x="30" y="92" width="18" height="22" rx="3" fill="#1e293b" stroke="url(#cyanNeon)" strokeWidth="1.5" />
          <circle cx="39" cy="100" r="4" fill="#94a3b8" />
          <line x1="33" y1="108" x2="45" y2="108" stroke="#06b6d4" strokeWidth="1.5" />

          {/* Forensic Bio-hazard / DNA Analyzer Patch on Right */}
          <circle cx="88" cy="98" r="8" fill="#042f2e" stroke="#14b8a6" strokeWidth="1.5" />
          <path d="M88 93 L88 103 M83 98 L93 98" stroke="#5eead4" strokeWidth="1.5" />

          {/* Neck / Hood */}
          <path d="M50 68 L78 68 L80 82 L48 82 Z" fill="#334155" />

          {/* Head */}
          <ellipse cx="64" cy="54" rx="19" ry="23" fill="#475569" />

          {/* High-Tech Forensic UV HUD Glasses */}
          <rect x="42" y="46" width="44" height="16" rx="6" fill="#083344" stroke="url(#cyanNeon)" strokeWidth="2" filter="url(#cyanGleam)" />
          <circle cx="53" cy="54" r="5" fill="#22d3ee" fillOpacity="0.8" />
          <circle cx="75" cy="54" r="5" fill="#22d3ee" fillOpacity="0.8" />
          <line x1="53" y1="49" x2="53" y2="59" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="48" y1="54" x2="58" y2="54" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="75" y1="49" x2="75" y2="59" stroke="#ffffff" strokeWidth="0.8" />
          <line x1="70" y1="54" x2="80" y2="54" stroke="#ffffff" strokeWidth="0.8" />

          {/* Headlamp / Analysis Scanner on Forehead */}
          <rect x="58" y="32" width="12" height="8" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />
          <circle cx="64" cy="36" r="2.5" fill="#67e8f9" filter="url(#cyanGleam)" />

          {/* Tag Title */}
          <rect x="46" y="106" width="36" height="12" rx="3" fill="#083344" stroke="#06b6d4" strokeWidth="1" />
          <text x="64" y="115" fill="#67e8f9" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">SIC FORENSIC</text>
        </svg>
      );

    // ==========================================
    // 🕵️‍♂️ 4. SIC TACTICAL / SIC MALE (Elite Operacional)
    // ==========================================
    case 'sic_tactical':
    case 'sic_1':
    case 'sic_male':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sicTacticalBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="silverPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <filter id="silverGleam" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#sicTacticalBg)" />
          <circle cx="64" cy="64" r="58" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Tactical Body Rig */}
          <path d="M18 116 C22 90, 38 80, 64 80 C90 80, 106 90, 110 116 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          
          {/* Carbon Vest Plate */}
          <rect x="36" y="86" width="56" height="32" rx="4" fill="#020617" stroke="#475569" strokeWidth="1.5" />
          <text x="64" y="104" fill="url(#silverPlate)" fontSize="14" fontWeight="900" letterSpacing="3" textAnchor="middle" fontFamily="sans-serif">SIC</text>
          <line x1="42" y1="110" x2="86" y2="110" stroke="#0ea5e9" strokeWidth="1.5" />

          {/* Silver Detective 6-Point Star Badge */}
          <polygon points="32,88 34,93 39,94 35,97 36,102 32,99 28,102 29,97 25,94 30,93" fill="url(#silverPlate)" stroke="#475569" strokeWidth="0.6" filter="url(#silverGleam)" />

          {/* Head & Tactical Cap */}
          <ellipse cx="64" cy="54" rx="19" ry="23" fill="#334155" />
          <path d="M40 42 C40 26, 88 26, 88 42 L92 48 L36 48 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
          <rect x="52" y="32" width="24" height="10" rx="2" fill="#020617" stroke="url(#silverPlate)" strokeWidth="1" />
          <text x="64" y="40" fill="url(#silverPlate)" fontSize="6" fontWeight="900" textAnchor="middle">SIC</text>

          {/* Concealed Comms Headset */}
          <path d="M82 50 Q88 62, 74 66" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="72" cy="66" r="2.5" fill="#38bdf8" />
        </svg>
      );

    // ==========================================
    // 🛡️ 5. SIC 2 (Crachá Prata SIC)
    // ==========================================
    case 'sic_2':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sicShieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#e2e8f0" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <filter id="chromeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#sicShieldBg)" />
          <circle cx="64" cy="64" r="56" stroke="url(#chromeGrad)" strokeWidth="2" />

          {/* Grand 3D 6-Point Star Badge */}
          <g filter="url(#chromeGlow)">
            <polygon points="64,16 76,40 102,42 82,64 90,92 64,76 38,92 46,64 26,42 52,40" fill="url(#chromeGrad)" stroke="#1e293b" strokeWidth="2" />
          </g>

          {/* Central Blue Sunburst Seal */}
          <circle cx="64" cy="58" r="22" fill="#0f172a" stroke="url(#chromeGrad)" strokeWidth="2" />
          <circle cx="64" cy="58" r="18" fill="#1e3a8a" />
          
          {/* Miniature Scales & Star of Justice */}
          <polygon points="64,44 66,48 70,49 67,52 68,56 64,54 60,56 61,52 58,49 62,48" fill="#fef08a" />
          <text x="64" y="66" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle" letterSpacing="1.5" fontFamily="monospace">SIC</text>
          <text x="64" y="73" fill="#93c5fd" fontSize="5" fontWeight="bold" textAnchor="middle">ANGOLA</text>

          <text x="64" y="112" fill="url(#chromeGrad)" fontSize="8.5" fontWeight="900" textAnchor="middle" letterSpacing="1">INVESTIGAÇÃO</text>
        </svg>
      );

    // ==========================================
    // 🧭 6. SME BORDER OPERATOR / SME MALE (Fronteira & Imigração)
    // ==========================================
    case 'sme_border':
    case 'sme_border_operator':
    case 'sme_airport':
    case 'sme_frontier':
    case 'sme_1':
    case 'sme_male':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="smeBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="smeUniform" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="50%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <linearGradient id="goldSme" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="emeraldGleam" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#smeBg)" />
          <circle cx="64" cy="64" r="58" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Emerald Green Patrol Jacket */}
          <path d="M18 116 C22 88, 38 78, 64 78 C90 78, 106 88, 110 116 Z" fill="url(#smeUniform)" stroke="url(#goldSme)" strokeWidth="1.8" />
          
          {/* Golden Tactical Shoulder Straps */}
          <rect x="22" y="82" width="16" height="6" rx="2" fill="url(#goldSme)" />
          <rect x="90" y="82" width="16" height="6" rx="2" fill="url(#goldSme)" />

          {/* Center Tactical Zipper & Chevrons */}
          <line x1="64" y1="80" x2="64" y2="120" stroke="url(#goldSme)" strokeWidth="2" />
          <path d="M56 94 L64 100 L72 94" stroke="#6ee7b7" strokeWidth="1.8" fill="none" />
          <path d="M56 102 L64 108 L72 102" stroke="#6ee7b7" strokeWidth="1.8" fill="none" />

          {/* Golden Compass & Globe Badge */}
          <circle cx="36" cy="98" r="9" fill="#064e3b" stroke="url(#goldSme)" strokeWidth="1.5" filter="url(#emeraldGleam)" />
          <ellipse cx="36" cy="98" rx="4" ry="9" fill="none" stroke="url(#goldSme)" strokeWidth="1" />
          <line x1="27" y1="98" x2="45" y2="98" stroke="url(#goldSme)" strokeWidth="1" />

          {/* Head & Green Peaked Cap */}
          <ellipse cx="64" cy="54" rx="19" ry="23" fill="#334155" />
          <path d="M38 40 C38 22, 90 22, 90 40 L94 46 L34 46 Z" fill="#065f46" stroke="url(#goldSme)" strokeWidth="1.5" />
          <path d="M32 46 C42 49, 86 49, 96 46 L92 50 C82 53, 46 53, 36 50 Z" fill="#022c22" stroke="url(#goldSme)" strokeWidth="1" />

          {/* SME Golden Globe Emblem on Cap */}
          <circle cx="64" cy="34" r="6" fill="url(#goldSme)" filter="url(#emeraldGleam)" />
          <polygon points="64,24 66,28 70,29 67,32 68,36 64,34 60,36 61,32 58,29 62,28" fill="#fef08a" />

          <rect x="46" y="108" width="36" height="12" rx="3" fill="#064e3b" stroke="url(#goldSme)" strokeWidth="1" />
          <text x="64" y="117" fill="#fef08a" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">SME FRONTIER</text>
        </svg>
      );

    // ==========================================
    // 🌐 7. SME 2 / SME FEMALE (Selo Fronteiriço SME)
    // ==========================================
    case 'sme_2':
    case 'sme_female':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sme2Bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <linearGradient id="sme2Gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#sme2Bg)" />
          <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="2" strokeDasharray="6 3" />

          {/* 3D Global Sovereignty Seal */}
          <circle cx="64" cy="58" r="30" fill="#065f46" stroke="#34d399" strokeWidth="3" />
          <circle cx="64" cy="58" r="24" stroke="#6ee7b7" strokeWidth="1.5" />
          <ellipse cx="64" cy="58" rx="12" ry="24" stroke="#6ee7b7" strokeWidth="1.5" fill="none" />
          <line x1="40" y1="58" x2="88" y2="58" stroke="#6ee7b7" strokeWidth="1.5" />
          <line x1="44" y1="48" x2="84" y2="48" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="44" y1="68" x2="84" y2="68" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2" />

          {/* Compass Rose Points */}
          <polygon points="64,20 68,32 64,28 60,32" fill="#fef08a" />
          <polygon points="64,96 68,84 64,88 60,84" fill="#fef08a" />
          <polygon points="26,58 38,62 34,58 38,54" fill="#fef08a" />
          <polygon points="102,58 90,62 94,58 90,54" fill="#fef08a" />

          <text x="64" y="112" fill="#a7f3d0" fontSize="8.5" fontWeight="900" textAnchor="middle" letterSpacing="1">MIGRAÇÃO & FRONTEIRAS</text>
        </svg>
      );

    // ==========================================
    // 🚒 8. SPCB ELITE RESCUE / SPCB MALE (Bombeiros & Protecção Civil)
    // ==========================================
    case 'spcb_elite_rescue':
    case 'spcb_rescue':
    case 'spcb_1':
    case 'spcb_male':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fireBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7f1d1d" />
              <stop offset="50%" stopColor="#450a0a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="turnoutSuit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="goldVisor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id="fireGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#fireBg)" />
          <circle cx="64" cy="64" r="58" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Heavy Turnout Bunker Jacket */}
          <path d="M18 116 C22 90, 38 80, 64 80 C90 80, 106 90, 110 116 Z" fill="url(#turnoutSuit)" stroke="#ea580c" strokeWidth="2" />
          
          {/* Fluorescent Scotchlite Reflective Safety Stripes */}
          <path d="M22 98 L106 98 L104 106 L24 106 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          <path d="M26 100 L102 100 L100 104 L28 104 Z" fill="#ffffff" />

          {/* Heavy Duty SCBA Chest Harness & Maltese Cross */}
          <circle cx="64" cy="92" r="8" fill="#7f1d1d" stroke="#fef08a" strokeWidth="1.5" filter="url(#fireGlow)" />
          <path d="M64 86 L64 98 M58 92 L70 92" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />

          {/* Neck / Nomex Flash Hood */}
          <path d="M50 68 L78 68 L80 82 L48 82 Z" fill="#451a03" />

          {/* Head */}
          <ellipse cx="64" cy="54" rx="19" ry="23" fill="#78350f" />

          {/* Modern Gold Mirror Firefighter Helmet */}
          <path d="M36 40 C36 16, 92 16, 92 40 L96 46 L32 46 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          
          {/* Gold Thermal Face Visor (Mirrored) */}
          <rect x="42" y="44" width="44" height="18" rx="5" fill="url(#goldVisor)" stroke="#fef08a" strokeWidth="1.5" filter="url(#fireGlow)" />
          <line x1="46" y1="48" x2="62" y2="48" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* SPCB Fire Badge Crest on Helmet Crest */}
          <polygon points="64,22 66,27 71,28 67,31 68,36 64,33 60,36 61,31 57,28 62,27" fill="#fef08a" />

          <rect x="44" y="108" width="40" height="12" rx="3" fill="#7f1d1d" stroke="#f97316" strokeWidth="1" />
          <text x="64" y="117" fill="#fef08a" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">SPCB RESCUE</text>
        </svg>
      );

    // ==========================================
    // 🔥 9. SPCB 2 / SPCB FEMALE (Chama de Protecção)
    // ==========================================
    case 'spcb_2':
    case 'spcb_female':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="plasmaFire" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7f1d1d" />
              <stop offset="30%" stopColor="#dc2626" />
              <stop offset="60%" stopColor="#ea580c" />
              <stop offset="85%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="flameBurst" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="128" height="128" rx="28" fill="#450a0a" />
          <circle cx="64" cy="64" r="56" stroke="#f97316" strokeWidth="2" />

          {/* Crossed Golden Firefighter Axes */}
          <line x1="28" y1="28" x2="100" y2="100" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="28" x2="28" y2="100" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
          <path d="M24 24 C28 20, 36 28, 32 36 Z" fill="#94a3b8" />
          <path d="M104 24 C100 20, 92 28, 96 36 Z" fill="#94a3b8" />

          {/* Roaring Triple Fire Core */}
          <g filter="url(#flameBurst)">
            <path d="M64 16 C76 36, 92 48, 86 72 C80 94, 48 94, 42 72 C36 48, 52 36, 64 16 Z" fill="url(#plasmaFire)" />
            <path d="M64 42 C70 54, 78 62, 74 76 C70 88, 58 88, 54 76 C50 62, 58 54, 64 42 Z" fill="#fef08a" />
            <circle cx="64" cy="74" r="8" fill="#ffffff" />
          </g>

          <text x="64" y="112" fill="#fef08a" fontSize="8.5" fontWeight="900" textAnchor="middle" letterSpacing="1">SPCB BOMBEIROS</text>
        </svg>
      );

    // ==========================================
    // 🦺 10. SP HONRA & SP MALE / SP FEMALE (Serviço Penitenciário)
    // ==========================================
    case 'sp_honor':
    case 'sp_honra':
    case 'sp_1':
    case 'sp_2':
    case 'sp_male':
    case 'sp_female':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="spBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c0519" />
              <stop offset="50%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="spGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <filter id="spGleam" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#spBg)" />
          <circle cx="64" cy="64" r="58" stroke="#f43f5e" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Imperial Crimson & Wine Dress Jacket */}
          <path d="M18 116 C22 88, 38 78, 64 78 C90 78, 106 88, 110 116 Z" fill="#831843" stroke="url(#spGold)" strokeWidth="1.8" />
          
          {/* Golden Shoulder Epaulettes */}
          <ellipse cx="28" cy="84" rx="12" ry="6" fill="url(#spGold)" />
          <ellipse cx="100" cy="84" rx="12" ry="6" fill="url(#spGold)" />

          {/* 3D Scales of Justice on Chest */}
          <g filter="url(#spGleam)">
            <line x1="64" y1="84" x2="64" y2="108" stroke="url(#spGold)" strokeWidth="2.5" />
            <line x1="50" y1="88" x2="78" y2="88" stroke="url(#spGold)" strokeWidth="2" strokeLinecap="round" />
            {/* Left pan */}
            <path d="M46 94 C46 98, 54 98, 54 94 Z" fill="url(#spGold)" />
            <line x1="50" y1="88" x2="47" y2="94" stroke="url(#spGold)" strokeWidth="1" />
            <line x1="50" y1="88" x2="53" y2="94" stroke="url(#spGold)" strokeWidth="1" />
            {/* Right pan */}
            <path d="M74 94 C74 98, 82 98, 82 94 Z" fill="url(#spGold)" />
            <line x1="78" y1="88" x2="75" y2="94" stroke="url(#spGold)" strokeWidth="1" />
            <line x1="78" y1="88" x2="81" y2="94" stroke="url(#spGold)" strokeWidth="1" />
          </g>

          {/* Head & Officer Peaked Cap */}
          <ellipse cx="64" cy="54" rx="19" ry="23" fill="#334155" />
          <path d="M38 40 C38 22, 90 22, 90 40 L94 46 L34 46 Z" fill="#4c0519" stroke="url(#spGold)" strokeWidth="1.5" />
          <path d="M32 46 C42 49, 86 49, 96 46 L92 50 C82 53, 46 53, 36 50 Z" fill="#1e1b4b" stroke="url(#spGold)" strokeWidth="1" />

          {/* SP Badge on Cap */}
          <polygon points="64,24 66,28 70,29 67,32 68,36 64,34 60,36 61,32 58,29 62,28" fill="#fef08a" />

          <rect x="42" y="108" width="44" height="12" rx="3" fill="#4c0519" stroke="url(#spGold)" strokeWidth="1" />
          <text x="64" y="117" fill="#fef08a" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">SP PENITENCIÁRIO</text>
        </svg>
      );

    // ==========================================
    // 👑 11. MININT GALA GOLD (Comissário-Geral Lendário)
    // ==========================================
    case 'minint_commissar':
    case 'minint_gala_gold':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gold24k" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id="divineGleam" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="128" height="128" rx="28" fill="#0f172a" />
          <circle cx="64" cy="64" r="58" stroke="url(#gold24k)" strokeWidth="2.5" filter="url(#divineGleam)" />
          
          {/* Radiating Divine Sunbeams */}
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="64"
              y1="64"
              x2={64 + 54 * Math.cos((i * 30 * Math.PI) / 180)}
              y2={64 + 54 * Math.sin((i * 30 * Math.PI) / 180)}
              stroke="url(#gold24k)"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          ))}

          {/* Solid Gold Brocade Commander Tunic */}
          <path d="M16 116 C20 84, 36 74, 64 74 C92 74, 108 84, 112 116 Z" fill="url(#gold24k)" stroke="#ffffff" strokeWidth="1.5" />
          
          {/* Triple Commander Stars on Chest */}
          <g filter="url(#divineGleam)">
            <polygon points="50,92 52,96 56,97 53,100 54,104 50,102 46,104 47,100 44,97 48,96" fill="#ffffff" />
            <polygon points="64,90 66,94 70,95 67,98 68,102 64,100 60,102 61,98 58,95 62,94" fill="#ffffff" />
            <polygon points="78,92 80,96 84,97 81,100 82,104 78,102 74,104 75,100 72,97 76,96" fill="#ffffff" />
          </g>

          {/* Grand Crown of Authority */}
          <g filter="url(#divineGleam)">
            <path d="M38 48 L46 26 L64 36 L82 26 L90 48 Z" fill="url(#gold24k)" stroke="#ffffff" strokeWidth="1.2" />
            <circle cx="46" cy="24" r="3" fill="#ffffff" />
            <circle cx="64" cy="34" r="3.5" fill="#f43f5e" />
            <circle cx="82" cy="24" r="3" fill="#ffffff" />
          </g>

          <text x="64" y="116" fill="#fef08a" fontSize="8" fontWeight="900" textAnchor="middle" letterSpacing="1">COMISSÁRIO-GERAL</text>
        </svg>
      );

    // ==========================================
    // 🛡️ 12. PNA 2 (Escudo Dourado PNA)
    // ==========================================
    case 'pna_2':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pnaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect width="128" height="128" rx="28" fill="#0f172a" />
          <circle cx="64" cy="64" r="56" stroke="url(#pnaGoldGrad)" strokeWidth="2" />
          <path d="M64 18 L98 32 V62 C98 88 80 108 64 114 C48 108 30 88 30 62 V32 L64 18 Z" fill="#1e3a8a" stroke="url(#pnaGoldGrad)" strokeWidth="3" />
          <polygon points="64,36 69,50 84,52 73,62 76,77 64,69 52,77 55,62 44,52 59,50" fill="url(#pnaGoldGrad)" />
          <circle cx="64" cy="58" r="6" fill="#0f172a" stroke="#fef08a" strokeWidth="1" />
          <text x="64" y="98" fill="#fef08a" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="2">PNA</text>
        </svg>
      );

    // ==========================================
    // 👮‍♂️ 13. PNA TRANSITO / PNA INTERVENCAO / PNA 1
    // ==========================================
    case 'pna_traffic':
    case 'pna_transito':
    case 'pna_intervencao':
    case 'pna_1':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pnaPatrolBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="pnaGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#pnaPatrolBg)" />
          <circle cx="64" cy="64" r="58" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Standard Patrol Police Shirt */}
          <path d="M18 116 C22 88, 38 78, 64 78 C90 78, 106 88, 110 116 Z" fill="#1e3a8a" stroke="url(#pnaGold)" strokeWidth="1.8" />
          
          {/* Reflective Traffic / Duty Harness */}
          {id === 'pna_transito' && (
            <>
              <line x1="28" y1="84" x2="64" y2="116" stroke="#ffffff" strokeWidth="4" />
              <line x1="100" y1="84" x2="64" y2="116" stroke="#ffffff" strokeWidth="4" />
            </>
          )}

          {/* Gold Star Badge on Chest */}
          <polygon points="36,92 38,96 42,97 39,100 40,104 36,102 32,104 33,100 30,97 34,96" fill="url(#pnaGold)" />

          {/* Head & Peak Police Cap */}
          <ellipse cx="64" cy="54" rx="19" ry="23" fill="#334155" />
          <path d="M38 40 C38 22, 90 22, 90 40 L94 46 L34 46 Z" fill="#1e40af" stroke="url(#pnaGold)" strokeWidth="1.5" />
          <path d="M32 46 C42 49, 86 49, 96 46 L92 50 C82 53, 46 53, 36 50 Z" fill="#09090b" stroke="url(#pnaGold)" strokeWidth="1" />

          {/* Cap Badge */}
          <polygon points="64,24 66,28 70,29 67,32 68,36 64,34 60,36 61,32 58,29 62,28" fill="#fef08a" />

          <rect x="42" y="108" width="44" height="12" rx="3" fill="#0f172a" stroke="url(#pnaGold)" strokeWidth="1" />
          <text x="64" y="117" fill="#fef08a" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">
            {id === 'pna_transito' ? 'PNA TRÂNSITO' : id === 'pna_intervencao' ? 'PIR TÁCTICO' : 'PNA OFICIAL'}
          </text>
        </svg>
      );

    // ==========================================
    // 🎓 14. MININT INSTRUTOR (Academia)
    // ==========================================
    case 'minint_instrutor':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="instBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="goldInst" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          <rect width="128" height="128" rx="28" fill="url(#instBg)" />
          <circle cx="64" cy="64" r="58" stroke="url(#goldInst)" strokeWidth="1.5" />

          {/* Academic Instructor Blazer */}
          <path d="M18 116 C22 88, 38 78, 64 78 C90 78, 106 88, 110 116 Z" fill="#1e1b4b" stroke="url(#goldInst)" strokeWidth="1.8" />
          
          {/* Golden Sash & Academic Medal */}
          <line x1="36" y1="82" x2="94" y2="116" stroke="url(#goldInst)" strokeWidth="3" />
          <circle cx="64" cy="98" r="8" fill="#312e81" stroke="url(#goldInst)" strokeWidth="1.5" />
          <text x="64" y="101" fill="#fef08a" fontSize="8" fontWeight="bold" textAnchor="middle">★</text>

          {/* Head & Mortarboard / Academic Cap */}
          <ellipse cx="64" cy="56" rx="18" ry="22" fill="#334155" />
          <polygon points="64,24 104,36 64,48 24,36" fill="#1e1b4b" stroke="url(#goldInst)" strokeWidth="2" />
          <rect x="52" y="44" width="24" height="8" fill="#1e1b4b" />
          <line x1="64" y1="36" x2="92" y2="52" stroke="url(#goldInst)" strokeWidth="2" />
          <circle cx="92" cy="54" r="3" fill="#fef08a" />

          <text x="64" y="117" fill="#fef08a" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">INSTRUTOR ACADEMIA</text>
        </svg>
      );

    // ==========================================
    // 🧊 15. STREAK FREEZE (Congelamento de Sequência)
    // ==========================================
    case 'streak_freeze':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cryoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="80%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <filter id="iceGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="128" height="128" rx="28" fill="#082f49" />
          <circle cx="64" cy="64" r="56" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" />
          {/* 3D Crystalline Cryo-Cube */}
          <g filter="url(#iceGlow)">
            <polygon points="64,22 96,38 96,76 64,96 32,76 32,38" fill="url(#cryoGrad)" stroke="#e0f2fe" strokeWidth="2.5" />
            <line x1="64" y1="22" x2="64" y2="96" stroke="#e0f2fe" strokeWidth="1.5" />
            <line x1="64" y1="58" x2="96" y2="38" stroke="#e0f2fe" strokeWidth="1.5" />
            <line x1="64" y1="58" x2="32" y2="38" stroke="#e0f2fe" strokeWidth="1.5" />
          </g>
          {/* Glowing Ice Shield Inner */}
          <polygon points="64,40 76,46 76,64 64,74 52,64 52,46" fill="#ffffff" fillOpacity="0.8" />
          <text x="64" y="60" fill="#0369a1" fontSize="12" fontWeight="900" textAnchor="middle">❄️</text>
          <text x="64" y="114" fill="#7dd3fc" fontSize="8.5" fontWeight="900" textAnchor="middle" letterSpacing="1">STREAK FREEZE</text>
        </svg>
      );

    // ==========================================
    // ⚡ 16. HINT POWERUPS (50:50)
    // ==========================================
    case 'hint_pack_3':
    case 'hint_pack_10':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <filter id="lightningGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="128" height="128" rx="28" fill="#3b0764" />
          <circle cx="64" cy="64" r="56" stroke="#c084fc" strokeWidth="2" strokeDasharray="8 4" />
          <g filter="url(#lightningGlow)">
            <polygon points="70,18 42,62 62,62 54,106 88,54 68,54" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
          </g>
          <rect x="36" y="86" width="56" height="18" rx="5" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.5" />
          <text x="64" y="99" fill="#fef08a" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1">50 : 50</text>
          <text x="64" y="117" fill="#e9d5ff" fontSize="7.5" fontWeight="900" textAnchor="middle">
            {id === 'hint_pack_10' ? 'SUPER LOTE 10x' : 'PACOTE 3x DICAS'}
          </text>
        </svg>
      );

    // ==========================================
    // 🚀 17. XP BOOSTER
    // ==========================================
    case 'duel_xp_boost':
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <filter id="thrusterGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="128" height="128" rx="28" fill="#431407" />
          <circle cx="64" cy="64" r="56" stroke="#ea580c" strokeWidth="2" />
          {/* Rocket Fuselage */}
          <path d="M64 20 C74 36, 80 60, 76 80 L52 80 C48 60, 54 36, 64 20 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="52,80 38,92 52,90" fill="url(#rocketGrad)" />
          <polygon points="76,80 90,92 76,90" fill="url(#rocketGrad)" />
          <circle cx="64" cy="46" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
          {/* Rocket Fire Jet */}
          <g filter="url(#thrusterGlow)">
            <polygon points="56,86 64,106 72,86" fill="#facc15" />
          </g>
          <rect x="36" y="96" width="56" height="16" rx="4" fill="#0f172a" stroke="#f97316" strokeWidth="1.5" />
          <text x="64" y="108" fill="#facc15" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1">2X XP BOOST</text>
        </svg>
      );

    // ==========================================
    // 👤 DEFAULT / CUSTOM CANDIDATE
    // ==========================================
    default:
      return (
        <svg viewBox="0 0 128 128" width={width} height={height} className={`select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="defBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="defGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect width="128" height="128" rx="28" fill="url(#defBg)" />
          <circle cx="64" cy="64" r="56" stroke="url(#defGold)" strokeWidth="1.8" />
          {/* Candidate Body */}
          <path d="M22 116 C26 90, 40 82, 64 82 C88 82, 102 90, 106 116 Z" fill="#1e40af" stroke="url(#defGold)" strokeWidth="1.8" />
          <ellipse cx="64" cy="56" rx="20" ry="24" fill="#334155" />
          <polygon points="64,28 67,34 74,35 69,40 70,47 64,43 58,47 59,40 54,35 61,34" fill="url(#defGold)" />
          <rect x="42" y="106" width="44" height="12" rx="3" fill="#0f172a" stroke="url(#defGold)" strokeWidth="1" />
          <text x="64" y="115" fill="#fef08a" fontSize="7.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">MININT ANGOLA</text>
        </svg>
      );
  }
};

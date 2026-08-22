import React from 'react';
import { 
  Zap, 
  Snowflake, 
  Sparkles, 
  Shield, 
  Crown, 
  Award, 
  Rocket, 
  Flame, 
  Scale, 
  Compass, 
  Globe,
  GraduationCap, 
  Medal, 
  Star,
  Swords,
  Lightbulb,
  FileCheck2,
  BadgeCheck,
  CheckCircle2,
  Gem,
  Lock,
  Layers
} from 'lucide-react';
import { MININTBranch } from '../types';

export interface ShopItemIconProps {
  type?: string;
  category?: string;
  symbol?: string;
  name?: string;
  id?: string;
  badgeBg?: string;
  layerClass?: string;
  branch?: MININTBranch;
  organ?: MININTBranch;
  imageUrl?: string;
  amount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
}

export const ShopItemIcon: React.FC<ShopItemIconProps> = ({
  type,
  category,
  symbol,
  name = '',
  id = '',
  badgeBg,
  layerClass,
  branch,
  organ,
  imageUrl,
  amount,
  size = 'md',
  className = '',
}) => {
  const effectiveBranch = branch || organ;
  const normalizedId = id.toLowerCase();
  const normalizedName = name.toLowerCase();

  // Resolve pixel and layout sizing
  let containerSizeClass = 'w-12 h-12';
  let iconSize = 24;
  let symbolTextSize = 'text-2xl';
  let badgePillSize = 'text-[7px] px-1 py-0.2';

  if (typeof size === 'number') {
    iconSize = Math.round(size * 0.52);
    symbolTextSize = size > 90 ? 'text-6xl' : size > 60 ? 'text-4xl' : size > 40 ? 'text-2xl' : 'text-base';
    badgePillSize = size > 70 ? 'text-[9px] px-2 py-0.5' : 'text-[7px] px-1 py-0.2';
  } else if (size === 'sm') {
    containerSizeClass = 'w-8 h-8';
    iconSize = 16;
    symbolTextSize = 'text-base';
    badgePillSize = 'text-[6px] px-1 py-0.1';
  } else if (size === 'md') {
    containerSizeClass = 'w-12 h-12';
    iconSize = 24;
    symbolTextSize = 'text-2xl';
    badgePillSize = 'text-[7px] px-1.5 py-0.2';
  } else if (size === 'lg') {
    containerSizeClass = 'w-16 h-16';
    iconSize = 32;
    symbolTextSize = 'text-3xl';
    badgePillSize = 'text-[8px] px-2 py-0.5';
  } else if (size === 'xl') {
    containerSizeClass = 'w-24 h-24 sm:w-28 sm:h-28';
    iconSize = 48;
    symbolTextSize = 'text-5xl';
    badgePillSize = 'text-[10px] px-2.5 py-0.5';
  }

  const customStyle: React.CSSProperties = typeof size === 'number' ? { width: size, height: size } : {};

  // ==========================================
  // 1. POWER-UPS & BOOSTERS
  // ==========================================

  // 1.1 CONGELAMENTO DE SEQUÊNCIA (Streak Freeze - Cristal de Gelo Azul)
  if (type === 'streak_freeze' || category === 'streak' || normalizedId.includes('streak_freeze')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-700 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-300/50 select-none group ${className}`}
      >
        <div className="w-full h-full rounded-[14px] bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center relative overflow-hidden">
          {/* Shimmering Ice Highlight */}
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-cyan-200/30 rounded-full blur-md pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-cyan-300/20 pointer-events-none" />

          {/* Ice Crystal Visual SVG & Lucide */}
          <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
            <div className="relative flex items-center justify-center">
              <Snowflake 
                size={iconSize} 
                className="text-cyan-200 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-pulse" 
              />
              <Sparkles 
                size={Math.max(10, Math.round(iconSize * 0.45))} 
                className="absolute -top-1 -right-1 text-white animate-spin drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" 
                style={{ animationDuration: '6s' }}
              />
            </div>
          </div>

          {/* Tactical Freeze Label */}
          <span className="relative z-10 text-[8px] sm:text-[9px] font-black font-mono tracking-wider text-cyan-200 uppercase bg-blue-950/90 px-1.5 py-0.2 rounded mt-0.5 border border-cyan-400/40 shadow-xs">
            GELO
          </span>
        </div>
      </div>
    );
  }

  // 1.2 PACOTES DE DICAS EXTRAS (3x e 10x - Lâmpadas/Ajuda 50:50)
  if (type === 'hint_powerup' || category === 'powerups' || normalizedId.includes('hint_pack')) {
    const isSuperPack = normalizedId.includes('10') || amount === 10;
    const packCount = isSuperPack ? '10x' : '3x';

    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br ${
          isSuperPack 
            ? 'from-purple-500 via-fuchsia-600 to-indigo-900 ring-purple-300/50 shadow-purple-500/35' 
            : 'from-indigo-500 via-purple-600 to-purple-900 ring-indigo-300/40 shadow-indigo-500/30'
        } p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg ring-1 select-none group ${className}`}
      >
        <div className="w-full h-full rounded-[14px] bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center relative overflow-hidden">
          {/* Mystical Energy Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-fuchsia-300/20 pointer-events-none" />
          <div className="absolute top-1 right-1 w-8 h-8 bg-purple-400/25 rounded-full blur-xs pointer-events-none" />

          {/* Lamp & 50:50 Visual */}
          <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
            <div className="relative flex items-center justify-center">
              <Lightbulb 
                size={iconSize} 
                className="text-amber-300 fill-amber-400/40 filter drop-shadow-[0_0_10px_rgba(250,204,21,0.85)]" 
              />
              <Zap 
                size={Math.max(10, Math.round(iconSize * 0.45))} 
                className="absolute -bottom-0.5 -right-0.5 text-purple-200 fill-purple-300 drop-shadow-[0_0_6px_rgba(192,132,252,0.9)]" 
              />
            </div>
          </div>

          {/* Badge Pack Count Label */}
          <span className="relative z-10 text-[8px] sm:text-[9px] font-black font-mono tracking-tight text-amber-200 uppercase bg-purple-950/90 px-1.5 py-0.2 rounded mt-0.5 border border-purple-400/40 shadow-xs">
            {packCount} DICA
          </span>
        </div>
      </div>
    );
  }

  // 1.3 BOOSTER XP DUPLO 1 HORA (Raio Dourado com Indicador '2X XP')
  if (type === 'booster' || type === 'xp_booster' || category === 'boosters' || normalizedId.includes('xp_boost')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-orange-500/30 ring-1 ring-amber-300/50 select-none group ${className}`}
      >
        <div className="w-full h-full rounded-[14px] bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center relative overflow-hidden">
          {/* Intense Golden Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-transparent to-amber-200/25 pointer-events-none" />
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-amber-400/30 rounded-full blur-md pointer-events-none" />

          {/* Lightning / Rocket Icon */}
          <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
            <div className="relative flex items-center justify-center">
              <Zap 
                size={iconSize} 
                className="text-amber-300 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.95)]" 
              />
              <Sparkles 
                size={Math.max(10, Math.round(iconSize * 0.4))} 
                className="absolute -top-1 -right-1 text-white animate-pulse" 
              />
            </div>
          </div>

          {/* '2X XP' Tag */}
          <span className="relative z-10 text-[8px] sm:text-[9px] font-black font-mono tracking-tight text-amber-300 uppercase bg-slate-950/90 px-1.5 py-0.2 rounded mt-0.5 border border-amber-400/40 shadow-xs">
            2X XP
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. INSÍGNIAS DOS ÓRGÃOS (PNA, SIC, SME, SP, SPCB, MININT)
  // ==========================================

  // 2.1 ESCUDO DOURADO PNA (Escudo dourado brilhante da Polícia Nacional)
  if (normalizedId === 'pna_2' || normalizedId.includes('escudo_dourado_pna') || (effectiveBranch === 'PNA' && (type === 'badge' || type === 'pin'))) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border-2 border-blue-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-blue-500/25 ring-1 ring-amber-400/40 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-amber-500/10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <div className="relative flex items-center justify-center">
            <Shield 
              size={iconSize} 
              className="text-amber-400 fill-amber-500/30 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
            />
            <Star 
              size={Math.max(10, Math.round(iconSize * 0.4))} 
              className="absolute text-yellow-200 fill-yellow-300 drop-shadow-[0_0_4px_rgba(250,204,21,0.9)]" 
            />
          </div>
        </div>
        <span className={`absolute bottom-0.5 rounded font-mono font-black uppercase tracking-wider bg-blue-950/90 text-blue-300 border border-blue-400/40 ${badgePillSize}`}>
          PNA
        </span>
      </div>
    );
  }

  // 2.2 CRACHÁ PRATA SIC (Crachá policial prateado de investigação e perícia)
  if (normalizedId === 'sic_2' || normalizedId.includes('cracha_prata_sic') || (effectiveBranch === 'SIC' && (type === 'badge' || type === 'pin'))) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950 border-2 border-slate-300/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <div className="relative flex items-center justify-center">
            <BadgeCheck 
              size={iconSize} 
              className="text-slate-200 fill-cyan-900/40 filter drop-shadow-[0_0_8px_rgba(226,232,240,0.85)]" 
            />
            <Shield 
              size={Math.max(9, Math.round(iconSize * 0.38))} 
              className="absolute text-cyan-300 fill-cyan-400/50" 
            />
          </div>
        </div>
        <span className={`absolute bottom-0.5 rounded font-mono font-black uppercase tracking-wider bg-slate-950/90 text-cyan-300 border border-cyan-400/40 ${badgePillSize}`}>
          SIC
        </span>
      </div>
    );
  }

  // 2.3 SELO FRONTEIRIÇO SME (Selo/Passaporte migratório internacional)
  if (normalizedId === 'sme_2' || normalizedId.includes('selo_fronteirico_sme') || (effectiveBranch === 'SME' && (type === 'badge' || type === 'pin'))) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border-2 border-emerald-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-emerald-500/25 ring-1 ring-teal-400/40 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/20 via-transparent to-teal-500/10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <div className="relative flex items-center justify-center">
            <Globe 
              size={iconSize} 
              className="text-emerald-300 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
            />
            <Compass 
              size={Math.max(10, Math.round(iconSize * 0.42))} 
              className="absolute text-teal-100 drop-shadow-[0_0_4px_rgba(204,251,241,0.9)]" 
            />
          </div>
        </div>
        <span className={`absolute bottom-0.5 rounded font-mono font-black uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-400/40 ${badgePillSize}`}>
          SME
        </span>
      </div>
    );
  }

  // 2.4 BALANÇA DA JUSTIÇA SP (Balança simétrica do Serviço Penitenciário)
  if (normalizedId === 'sp_2' || normalizedId.includes('balanca_justica_sp') || (effectiveBranch === 'SP' && (type === 'badge' || type === 'pin'))) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-purple-950 via-slate-900 to-zinc-950 border-2 border-purple-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-purple-500/20 ring-1 ring-purple-300/40 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 via-transparent to-amber-500/10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <div className="relative flex items-center justify-center">
            <Scale 
              size={iconSize} 
              className="text-purple-300 filter drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]" 
            />
          </div>
        </div>
        <span className={`absolute bottom-0.5 rounded font-mono font-black uppercase tracking-wider bg-purple-950/90 text-purple-300 border border-purple-400/40 ${badgePillSize}`}>
          SP
        </span>
      </div>
    );
  }

  // 2.5 CHAMA DE PROTECÇÃO SPCB (Chama de emergência e bombeiros)
  if (normalizedId === 'spcb_2' || normalizedId.includes('chama_proteccao_spcb') || (effectiveBranch === 'SPCB' && (type === 'badge' || type === 'pin'))) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-red-950 via-orange-950 to-amber-950 border-2 border-red-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-red-500/30 ring-1 ring-orange-400/40 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/25 via-transparent to-amber-500/15 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <div className="relative flex items-center justify-center">
            <Flame 
              size={iconSize} 
              className="text-amber-400 fill-red-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-pulse" 
            />
          </div>
        </div>
        <span className={`absolute bottom-0.5 rounded font-mono font-black uppercase tracking-wider bg-red-950/90 text-amber-300 border border-red-400/40 ${badgePillSize}`}>
          SPCB
        </span>
      </div>
    );
  }

  // 2.6 INSTRUTOR DE ACADEMIA MININT (Medalha/Estrela de mestre)
  if (normalizedId === 'minint_instrutor' || normalizedId.includes('instrutor')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-900 border-2 border-amber-300 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/60 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/30 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <div className="relative flex items-center justify-center">
            <GraduationCap 
              size={iconSize} 
              className="text-amber-100 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" 
            />
            <Star 
              size={Math.max(9, Math.round(iconSize * 0.38))} 
              className="absolute -bottom-1 text-yellow-300 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)]" 
            />
          </div>
        </div>
        <span className={`absolute bottom-0.5 rounded font-mono font-black uppercase tracking-wider bg-slate-950/90 text-amber-300 border border-amber-400/50 ${badgePillSize}`}>
          MININT
        </span>
      </div>
    );
  }

  // ==========================================
  // 3. PINS ESPECÍFICOS DE AVATAR
  // ==========================================

  // 3.1 ÁGUIA DE AÇO (badge_eagle)
  if (normalizedId === 'badge_eagle' || normalizedName.includes('águia de aço') || normalizedName.includes('aguia')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 border-2 border-sky-400/70 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/15 via-transparent to-black/40 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <span className={`${symbolTextSize} filter drop-shadow-[0_2px_8px_rgba(56,189,248,0.7)]`}>🦅</span>
        </div>
      </div>
    );
  }

  // 3.2 ESTRELA DE HONRA (badge_star)
  if (normalizedId === 'badge_star' || normalizedName.includes('estrela de honra')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-600 to-slate-950 border-2 border-amber-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md shadow-amber-500/20 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-amber-500/20 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <Star 
            size={iconSize} 
            className="text-amber-300 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.85)]" 
          />
        </div>
      </div>
    );
  }

  // 3.3 ESCUDO DA LEI (badge_shield)
  if (normalizedId === 'badge_shield' || normalizedName.includes('escudo da lei')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 border-2 border-blue-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md shadow-blue-500/20 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-transparent to-black/40 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <Shield 
            size={iconSize} 
            className="text-blue-300 fill-blue-500/40 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" 
          />
        </div>
      </div>
    );
  }

  // 3.4 ESPADAS CRUZADAS (badge_swords)
  if (normalizedId === 'badge_swords' || normalizedName.includes('espadas cruzadas')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-zinc-800 via-neutral-900 to-rose-950 border-2 border-rose-400/70 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md shadow-rose-500/20 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-rose-400/15 via-transparent to-black/40 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <Swords 
            size={iconSize} 
            className="text-rose-300 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" 
          />
        </div>
      </div>
    );
  }

  // 3.5 MEDALHA DE MÉRITO (badge_medal)
  if (normalizedId === 'badge_medal' || normalizedName.includes('medalha de mérito') || normalizedName.includes('medalha de merito')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-amber-600 via-amber-800 to-slate-950 border-2 border-amber-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md shadow-amber-500/20 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-amber-500/20 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <Medal 
            size={iconSize} 
            className="text-amber-300 fill-amber-500/30 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.85)]" 
          />
        </div>
      </div>
    );
  }

  // 3.6 DISTINTIVO IMPERIAL (badge_crown)
  if (normalizedId === 'badge_crown' || normalizedName.includes('distintivo imperial') || normalizedName.includes('imperial')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-950 border-2 border-yellow-300 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md shadow-yellow-500/30 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/30 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <Crown 
            size={iconSize} 
            className="text-yellow-200 fill-yellow-400/60 filter drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]" 
          />
        </div>
      </div>
    );
  }

  // 3.7 CHAMA DE PRONTIDÃO (badge_flame)
  if (normalizedId === 'badge_flame' || normalizedName.includes('chama de prontidão') || normalizedName.includes('chama de prontidao')) {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br from-orange-600 via-red-700 to-slate-950 border-2 border-orange-400/80 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md shadow-orange-500/25 select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-orange-400/20 via-transparent to-red-500/20 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          <Flame 
            size={iconSize} 
            className="text-amber-300 fill-orange-500 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.85)]" 
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. FUNDOS & GRADIENTES (Backgrounds)
  // ==========================================
  if (type === 'background' || category === 'fundos' || category === 'backgrounds' || normalizedId.startsWith('bg_')) {
    // Map exact gradient classes and lighting based on item ID or name
    let gradientClass = layerClass || badgeBg || 'from-amber-600 via-yellow-500 to-amber-900';
    let ringColor = 'border-amber-400/60 shadow-amber-500/30';
    let labelText = 'GRADIENTE';
    let iconAccent: React.ReactNode = <Sparkles size={Math.max(12, Math.round(iconSize * 0.45))} className="text-white/90 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />;

    if (normalizedId === 'bg_dark_obsidian' || normalizedName.includes('obsidiana')) {
      gradientClass = 'from-zinc-950 via-slate-900 to-black';
      ringColor = 'border-zinc-500/80 ring-1 ring-zinc-400/40 shadow-black/80';
      labelText = 'OBSIDIANA';
      iconAccent = <span className="text-xs">🌑</span>;
    } else if (normalizedId === 'bg_golden_glory' || normalizedName.includes('aurora dourada') || normalizedName.includes('glory')) {
      gradientClass = 'from-amber-600 via-yellow-500 to-amber-900';
      ringColor = 'border-yellow-300 ring-1 ring-amber-400/60 shadow-amber-500/40';
      labelText = 'DOURADO';
      iconAccent = <Sparkles size={Math.max(12, Math.round(iconSize * 0.45))} className="text-yellow-100 fill-yellow-200 animate-pulse" />;
    } else if (normalizedId === 'bg_crimson_elite' || normalizedName.includes('operações especiais') || normalizedName.includes('crimson')) {
      gradientClass = 'from-rose-900 via-red-950 to-slate-950';
      ringColor = 'border-rose-500/80 ring-1 ring-red-500/40 shadow-rose-500/30';
      labelText = 'RUBRO';
      iconAccent = <span className="text-xs">🔴</span>;
    } else if (normalizedId === 'bg_emerald_command' || normalizedName.includes('comando esmeralda') || normalizedName.includes('emerald')) {
      gradientClass = 'from-emerald-800 via-teal-950 to-slate-950';
      ringColor = 'border-emerald-400/80 ring-1 ring-teal-400/40 shadow-emerald-500/30';
      labelText = 'ESMERALDA';
      iconAccent = <span className="text-xs">🟢</span>;
    } else if (normalizedId === 'bg_cyber_space' || normalizedName.includes('matriz digital') || normalizedName.includes('cyber')) {
      gradientClass = 'from-cyan-900 via-blue-950 to-indigo-950';
      ringColor = 'border-cyan-400/80 ring-1 ring-blue-500/40 shadow-cyan-500/35';
      labelText = 'CYBER';
      iconAccent = <span className="text-xs">🌌</span>;
    } else if (normalizedId === 'bg_sunset_patrol' || normalizedName.includes('patrulha crepúsculo') || normalizedName.includes('sunset')) {
      gradientClass = 'from-violet-900 via-purple-950 to-orange-950';
      ringColor = 'border-violet-400/80 ring-1 ring-orange-400/40 shadow-purple-500/30';
      labelText = 'CREPÚSCULO';
      iconAccent = <span className="text-xs">🌆</span>;
    }

    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-slate-950 border-2 ${ringColor} p-1 flex flex-col items-center justify-center relative overflow-hidden shadow-lg select-none group ${className}`}
      >
        {/* Pure CSS Gradient Surface (No Avatar Photo) */}
        <div
          className={`w-full h-full rounded-xl bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center relative overflow-hidden shadow-inner`}
        >
          {/* Realistic Specular Glare & Lighting Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-white/20 rounded-full blur-xs pointer-events-none" />

          {/* Central Artistic Palette Accent */}
          <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
            {iconAccent}
          </div>

          {/* Discreet Color Sub-Tag */}
          <span className={`relative z-10 rounded font-mono font-black uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white/90 border border-white/20 mt-0.5 ${badgePillSize}`}>
            {labelText}
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. MOLDURAS (Frames)
  // ==========================================
  if (type === 'frame' || category === 'molduras' || category === 'frames') {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-slate-950 border border-amber-500/30 p-1 flex items-center justify-center relative overflow-hidden shadow-md select-none ${className}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'Moldura'}
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transform group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center">
            <span className={symbolTextSize}>{symbol || '⭕'}</span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 6. ACESSÓRIOS DE ROSTO (Face Accessories)
  // ==========================================
  if (type === 'faceAccessory' || category === 'face') {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-slate-900 border border-white/15 flex items-center justify-center relative overflow-hidden shadow-md select-none ${className}`}
      >
        <span className={symbolTextSize}>{symbol || '🥽'}</span>
      </div>
    );
  }

  // ==========================================
  // 7. GENERIC BADGE FALLBACK
  // ==========================================
  if (type === 'badge' || type === 'pin' || category === 'badges') {
    return (
      <div
        style={customStyle}
        className={`${containerSizeClass} rounded-2xl bg-gradient-to-br ${
          badgeBg || 'from-slate-900 via-amber-950/40 to-slate-950'
        } border-2 border-amber-400/60 p-0.5 flex flex-col items-center justify-center relative overflow-hidden shadow-md select-none group ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
          {symbol ? (
            <span className={`${symbolTextSize} filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]`}>{symbol}</span>
          ) : (
            <Shield size={iconSize} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          )}
        </div>
        {effectiveBranch && (
          <span className={`absolute bottom-0.5 rounded font-mono font-black uppercase tracking-wider bg-slate-950/90 text-white border border-white/15 ${badgePillSize}`}>
            {effectiveBranch}
          </span>
        )}
      </div>
    );
  }

  // ==========================================
  // 8. FINAL DEFAULT FALLBACK
  // ==========================================
  return (
    <div
      style={customStyle}
      className={`${containerSizeClass} rounded-2xl bg-gradient-to-br ${
        badgeBg || 'from-slate-900 via-slate-800 to-slate-950'
      } border border-amber-500/30 flex items-center justify-center relative overflow-hidden shadow-md select-none ${className}`}
    >
      <span className={symbolTextSize}>{symbol || '🎖️'}</span>
    </div>
  );
};

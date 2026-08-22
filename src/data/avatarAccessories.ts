import { MININTBranch } from '../types';
import { SHOP_ITEMS } from './shopItems';

export type AccessoryCategory = 'frames' | 'backgrounds' | 'badges' | 'face';

export type AccessoryType = 'frame' | 'background' | 'badge' | 'faceAccessory';

export interface AccessoryItem {
  id: string;
  name: string;
  category: AccessoryCategory;
  type?: AccessoryType;
  cost: number;
  description: string;
  icon: string;
  isDefault?: boolean;
  previewClass?: string;
  layerClass?: string;
  glowColor?: string;
  imageUrl?: string;
  branch?: MININTBranch | string;
  organ?: MININTBranch | string;
}

// Inline SVG Data URLs for ultra-sharp, self-contained Vector Frames
const SVG_FRAME_FLAME = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="fireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#fbbf24"/>
      <stop offset="70%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Fiery Outer Halo -->
  <circle cx="60" cy="60" r="54" stroke="url(#fireGrad)" stroke-width="4.5" filter="url(#flameGlow)" opacity="0.95"/>
  <circle cx="60" cy="60" r="50" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 3" opacity="0.85"/>
  
  <!-- 12 Stylized Flame Tongues -->
  <g filter="url(#flameGlow)">
    <path d="M60 2 C64 12, 68 15, 60 23 C52 15, 56 12, 60 2Z" fill="#fef08a" />
    <path d="M89 10 C94 19, 93 25, 84 27 C80 20, 83 16, 89 10Z" fill="#fbbf24" />
    <path d="M110 31 C112 40, 107 46, 98 44 C98 36, 104 33, 110 31Z" fill="#f97316" />
    <path d="M118 60 C114 67, 106 67, 98 60 C106 53, 114 53, 118 60Z" fill="#ef4444" />
    <path d="M110 89 C104 94, 98 90, 98 81 C107 80, 112 84, 110 89Z" fill="#f97316" />
    <path d="M89 110 C83 112, 79 107, 84 98 C93 98, 94 104, 89 110Z" fill="#ef4444" />
    <path d="M60 118 C56 108, 52 105, 60 97 C68 105, 64 108, 60 118Z" fill="#fef08a" />
    <path d="M31 110 C26 101, 27 95, 36 93 C40 100, 37 104, 31 110Z" fill="#f97316" />
    <path d="M10 89 C8 80, 13 74, 22 76 C22 84, 16 87, 10 89Z" fill="#ef4444" />
    <path d="M2 60 C6 53, 14 53, 22 60 C14 67, 6 67, 2 60Z" fill="#fbbf24" />
    <path d="M10 31 C16 26, 22 30, 22 39 C13 40, 8 36, 10 31Z" fill="#f97316" />
    <path d="M31 10 C37 8, 41 13, 36 22 C27 22, 26 16, 31 10Z" fill="#ef4444" />
  </g>
  <circle cx="60" cy="60" r="48" stroke="#fbbf24" stroke-width="1.8" opacity="0.9"/>
</svg>
`)}`;

const SVG_FRAME_GOLD = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="54" stroke="url(#goldMetal)" stroke-width="5" stroke-linecap="round"/>
  <circle cx="60" cy="60" r="49" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="6 3"/>
  <polygon points="60,3 62,10 69,10 63,14 65,21 60,17 55,21 57,14 51,10 58,10" fill="#fef08a" stroke="#d97706" stroke-width="0.5"/>
  <polygon points="60,117 62,110 69,110 63,106 65,99 60,103 55,99 57,106 51,110 58,110" fill="#fef08a" stroke="#d97706" stroke-width="0.5"/>
  <polygon points="3,60 10,62 10,69 14,63 21,65 17,60 21,55 14,57 10,51 10,58" fill="#fef08a" stroke="#d97706" stroke-width="0.5"/>
  <polygon points="117,60 110,62 110,69 106,63 99,65 103,60 99,55 106,57 110,51 110,58" fill="#fef08a" stroke="#d97706" stroke-width="0.5"/>
</svg>
`)}`;

const SVG_FRAME_CYBER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="cyberNeon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="54" stroke="url(#cyberNeon)" stroke-width="4.5"/>
  <circle cx="60" cy="60" r="49" stroke="#06b6d4" stroke-width="2" stroke-dasharray="14 6 4 6"/>
  <circle cx="60" cy="60" r="45" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2 6"/>
  <rect x="58" y="2" width="4" height="6" fill="#22d3ee" rx="1"/>
  <rect x="58" y="112" width="4" height="6" fill="#22d3ee" rx="1"/>
  <rect x="2" y="58" width="6" height="4" fill="#22d3ee" rx="1"/>
  <rect x="112" y="58" width="6" height="4" fill="#22d3ee" rx="1"/>
</svg>
`)}`;

const SVG_FRAME_LAUREL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="laurelGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="52" stroke="url(#laurelGold)" stroke-width="3"/>
  <g fill="url(#laurelGold)">
    <ellipse cx="60" cy="8" rx="4" ry="7" transform="rotate(-30 60 8)"/>
    <ellipse cx="60" cy="8" rx="4" ry="7" transform="rotate(30 60 8)"/>
    <ellipse cx="78" cy="14" rx="4" ry="7" transform="rotate(20 78 14)"/>
    <ellipse cx="94" cy="28" rx="4" ry="7" transform="rotate(45 94 28)"/>
    <ellipse cx="106" cy="46" rx="4" ry="7" transform="rotate(70 106 46)"/>
    <ellipse cx="110" cy="66" rx="4" ry="7" transform="rotate(95 110 66)"/>
    <ellipse cx="104" cy="86" rx="4" ry="7" transform="rotate(120 104 86)"/>
    <ellipse cx="90" cy="102" rx="4" ry="7" transform="rotate(145 90 102)"/>
    <ellipse cx="42" cy="14" rx="4" ry="7" transform="rotate(-20 42 14)"/>
    <ellipse cx="26" cy="28" rx="4" ry="7" transform="rotate(-45 26 28)"/>
    <ellipse cx="14" cy="46" rx="4" ry="7" transform="rotate(-70 14 46)"/>
    <ellipse cx="10" cy="66" rx="4" ry="7" transform="rotate(-95 10 66)"/>
    <ellipse cx="16" cy="86" rx="4" ry="7" transform="rotate(-120 16 86)"/>
    <ellipse cx="30" cy="102" rx="4" ry="7" transform="rotate(-145 30 102)"/>
  </g>
  <circle cx="60" cy="112" r="4" fill="#facc15"/>
</svg>
`)}`;

const SVG_FRAME_DIAMOND = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="35%" stop-color="#c084fc"/>
      <stop offset="70%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="54" stroke="url(#diamondGrad)" stroke-width="4.5"/>
  <circle cx="60" cy="60" r="49" stroke="#e0f2fe" stroke-width="1.5" stroke-dasharray="4 4"/>
  <polygon points="60,2 66,8 60,14 54,8" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
  <polygon points="60,106 66,112 60,118 54,112" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
  <polygon points="2,60 8,66 14,60 8,54" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
  <polygon points="106,60 112,66 118,60 112,54" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
</svg>
`)}`;

const SVG_FRAME_STRIPE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <circle cx="60" cy="60" r="53" stroke="#0f172a" stroke-width="6"/>
  <circle cx="60" cy="60" r="53" stroke="#f59e0b" stroke-width="6" stroke-dasharray="10 10"/>
  <circle cx="60" cy="60" r="48" stroke="#fbbf24" stroke-width="1.5"/>
</svg>
`)}`;

// 1. Molduras de Avatar (Frames ao redor do círculo)
export const ACCESSORY_FRAMES: AccessoryItem[] = [
  {
    id: 'frame_none',
    name: 'Padrão (Sem Moldura)',
    category: 'frames',
    cost: 0,
    description: 'Borda clássica de cadete MININT sem efeitos adicionais.',
    icon: '⭕',
    isDefault: true,
    layerClass: 'border-2 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
  },
  {
    id: 'frame_flame_warrior',
    name: 'Aura Chamas Operacionais',
    category: 'frames',
    cost: 50,
    description: 'Anel flamejante de alta prontidão e bravura em campo.',
    icon: '🔥',
    imageUrl: SVG_FRAME_FLAME,
    layerClass: 'border-[3px] border-orange-500 ring-2 ring-rose-500/80 shadow-[0_0_22px_rgba(239,68,68,0.85)] animate-pulse',
    glowColor: '#ef4444',
  },
  {
    id: 'frame_gold_shield',
    name: 'Escudo Dourado de Honra',
    category: 'frames',
    cost: 40,
    description: 'Borda dourada metálica cintilante com relevo nobre de comando.',
    icon: '🛡️',
    imageUrl: SVG_FRAME_GOLD,
    layerClass: 'border-[3px] border-amber-300 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.7)]',
    glowColor: '#f59e0b',
  },
  {
    id: 'frame_cyber_neon',
    name: 'Neon Táctico Cyber',
    category: 'frames',
    cost: 45,
    description: 'Anel cibernético ciano e azul de operações de elite.',
    icon: '⚡',
    imageUrl: SVG_FRAME_CYBER,
    layerClass: 'border-[3px] border-cyan-400 ring-2 ring-blue-500/80 shadow-[0_0_22px_rgba(6,182,212,0.8)]',
    glowColor: '#06b6d4',
  },
  {
    id: 'frame_laurel_imperial',
    name: 'Coroa de Louros Imperial',
    category: 'frames',
    cost: 60,
    description: 'Distintivo clássico de louros nobres para oficiais superiores.',
    icon: '👑',
    imageUrl: SVG_FRAME_LAUREL,
    layerClass: 'border-[3px] border-yellow-300 ring-2 ring-amber-500/90 shadow-[0_0_24px_rgba(250,204,21,0.85)]',
    glowColor: '#facc15',
  },
  {
    id: 'frame_diamond_vip',
    name: 'Diamante Platina Prismático',
    category: 'frames',
    cost: 75,
    description: 'Moldura cintilante com reflexos prismáticos de diamante.',
    icon: '💎',
    imageUrl: SVG_FRAME_DIAMOND,
    layerClass: 'border-[3px] border-sky-300 ring-2 ring-purple-400/80 shadow-[0_0_25px_rgba(56,189,248,0.85)]',
    glowColor: '#38bdf8',
  },
  {
    id: 'frame_security_stripe',
    name: 'Faixa de Segurança MININT',
    category: 'frames',
    cost: 35,
    description: 'Borda listrada de alta visibilidade e autoridade policial.',
    icon: '🚧',
    imageUrl: SVG_FRAME_STRIPE,
    layerClass: 'border-[3px] border-dashed border-amber-400 ring-2 ring-slate-900/60 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    glowColor: '#fbbf24',
  },
];

// 2. Fundos & Gradientes (Backgrounds dentro do círculo)
export const ACCESSORY_BACKGROUNDS: AccessoryItem[] = [
  {
    id: 'bg_default',
    name: 'Fundo Oficial do Ramo',
    category: 'backgrounds',
    cost: 0,
    description: 'Gradiente oficial de identificação da corporação do candidato.',
    icon: '🏛️',
    isDefault: true,
  },
  {
    id: 'bg_dark_obsidian',
    name: 'Obsidiana Táctica',
    category: 'backgrounds',
    cost: 30,
    description: 'Fundo ultra-escuro com acabamento metálico de blindagem.',
    icon: '🌑',
    layerClass: 'from-zinc-950 via-slate-900 to-black',
  },
  {
    id: 'bg_golden_glory',
    name: 'Aurora Dourada',
    category: 'backgrounds',
    cost: 50,
    description: 'Gradiente luxuoso de ouro e âmbar com reflexos solares.',
    icon: '✨',
    layerClass: 'from-amber-600 via-yellow-500 to-amber-900',
  },
  {
    id: 'bg_crimson_elite',
    name: 'Operações Especiais',
    category: 'backgrounds',
    cost: 45,
    description: 'Gradiente rubro carmesim escuro com contraste militar.',
    icon: '🔴',
    layerClass: 'from-rose-900 via-red-950 to-slate-950',
  },
  {
    id: 'bg_emerald_command',
    name: 'Comando Esmeralda',
    category: 'backgrounds',
    cost: 40,
    description: 'Fundo esmeralda profundo dos serviços de fronteira e controlo.',
    icon: '🟢',
    layerClass: 'from-emerald-800 via-teal-950 to-slate-950',
  },
  {
    id: 'bg_cyber_space',
    name: 'Matriz Digital',
    category: 'backgrounds',
    cost: 55,
    description: 'Fundo azul ultramarino e ciano com brilho futurista.',
    icon: '🌌',
    layerClass: 'from-cyan-900 via-blue-950 to-indigo-950',
  },
  {
    id: 'bg_sunset_patrol',
    name: 'Patrulha Crepúsculo',
    category: 'backgrounds',
    cost: 35,
    description: 'Gradiente suave de pôr do sol em violeta e laranja nobre.',
    icon: '🌆',
    layerClass: 'from-violet-900 via-purple-950 to-orange-950',
  },
];

// 3. Pins & Distintivos (Selos fixos posicionados no canto do avatar)
export const ACCESSORY_BADGES: AccessoryItem[] = [
  {
    id: 'badge_none',
    name: 'Nenhum Distintivo',
    category: 'badges',
    type: 'badge',
    cost: 0,
    description: 'Sem distintivo adicional no canto do avatar.',
    icon: '➖',
    isDefault: true,
  },
  {
    id: 'badge_eagle',
    name: 'Águia de Aço',
    category: 'badges',
    type: 'badge',
    cost: 35,
    description: 'Insígnia de vigilância aérea e soberania nacional.',
    icon: '🦅',
    branch: 'PNA',
    organ: 'PNA',
  },
  {
    id: 'badge_star',
    name: 'Estrela de Honra',
    category: 'badges',
    type: 'badge',
    cost: 30,
    description: 'Emblema estelar de dedicação exemplar aos estudos.',
    icon: '⭐',
    branch: 'SME',
    organ: 'SME',
  },
  {
    id: 'badge_shield',
    name: 'Escudo da Lei',
    category: 'badges',
    type: 'badge',
    cost: 40,
    description: 'Símbolo da defesa da lei e garantia da ordem pública.',
    icon: '🛡️',
    branch: 'PNA',
    organ: 'PNA',
  },
  {
    id: 'badge_swords',
    name: 'Espadas Cruzadas',
    category: 'badges',
    type: 'badge',
    cost: 45,
    description: 'Insígnia de bravura e prontidão combativa em campo.',
    icon: '⚔️',
    branch: 'SIC',
    organ: 'SIC',
  },
  {
    id: 'badge_medal',
    name: 'Medalha de Mérito',
    category: 'badges',
    type: 'badge',
    cost: 50,
    description: 'Condecoração máxima de serviço distinto e lealdade.',
    icon: '🎖️',
    branch: 'SP',
    organ: 'SP',
  },
  {
    id: 'badge_crown',
    name: 'Distintivo Imperial',
    category: 'badges',
    type: 'badge',
    cost: 65,
    description: 'Selo nobre de distinção para os melhores classificados.',
    icon: '👑',
    branch: 'MININT',
    organ: 'MININT',
  },
  {
    id: 'badge_flame',
    name: 'Chama de Prontidão',
    category: 'badges',
    type: 'badge',
    cost: 40,
    description: 'Emblema de coragem e resposta rápida aos desafios.',
    icon: '🔥',
    branch: 'SPCB',
    organ: 'SPCB',
  },
];

// 4. Acessórios de Rosto / Cabeça (Face & Head Gear)
export const ACCESSORY_FACE_ITEMS: AccessoryItem[] = [
  {
    id: 'face_none',
    name: 'Nenhum Acessório de Rosto',
    category: 'face',
    type: 'faceAccessory',
    cost: 0,
    description: 'Sem acessórios adicionais no rosto do avatar.',
    icon: '➖',
    isDefault: true,
  },
];

export const ALL_ACCESSORIES: AccessoryItem[] = [
  ...ACCESSORY_FRAMES,
  ...ACCESSORY_BACKGROUNDS,
  ...ACCESSORY_BADGES,
  ...ACCESSORY_FACE_ITEMS,
];

export function getAccessoryItem(id?: string): AccessoryItem | undefined {
  if (!id) return undefined;
  const found = ALL_ACCESSORIES.find(item => item.id === id);
  if (found) return found;

  const shopItem = SHOP_ITEMS.find(item => item.id === id);
  if (shopItem) {
    return {
      id: shopItem.id,
      name: shopItem.name,
      category: (shopItem.category === 'badges' ? 'badges' : shopItem.category === 'fundos' ? 'backgrounds' : 'frames') as AccessoryCategory,
      type: (shopItem.type === 'pin' ? 'badge' : shopItem.type as any) || 'badge',
      cost: shopItem.cost,
      description: shopItem.description,
      icon: shopItem.symbol || '🛡️',
      imageUrl: shopItem.assetPath,
      layerClass: shopItem.badgeBg,
      branch: shopItem.branch || shopItem.organ,
      organ: shopItem.organ || shopItem.branch,
    };
  }

  return undefined;
}


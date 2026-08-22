import { MININTBranch } from '../types';

export type ShopCategory = 
  | 'fardas' 
  | 'streak' 
  | 'powerups' 
  | 'boosters' 
  | 'badges' 
  | 'molduras' 
  | 'fundos' 
  | 'face';

export type ShopItemType = 
  | 'avatar'
  | 'avatar_farda' 
  | 'badge' 
  | 'booster' 
  | 'xp_booster' 
  | 'background' 
  | 'pin' 
  | 'frame' 
  | 'streak_freeze' 
  | 'hint_powerup' 
  | 'faceAccessory';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  cost: number;
  description: string;
  symbol: string;
  branch?: MININTBranch | string;
  organ?: MININTBranch | string;
  badgeBg?: string;
  isPopular?: boolean;
  isExclusive?: boolean;
  type: ShopItemType;
  amount?: number; // Quantity provided (e.g. 3 power-ups)
  assetPath?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // 1. Fardas & Avatares Especiais dos Órgãos (PNA, SIC, SME, SP, SPCB + Lendários)
  // PNA: Azul tático, Marinho profundo, Preto tático e Boina Vermelha
  {
    id: 'pna_pir',
    name: 'Farda Tática PIR (PNA)',
    category: 'fardas',
    cost: 140,
    description: 'Uniforme preto completo com colete tático e boina vermelha da Polícia de Intervenção Rápida.',
    symbol: '💂‍♂️',
    branch: 'PNA',
    organ: 'PNA',
    badgeBg: 'from-slate-950 via-slate-900 to-red-950',
    isPopular: true,
    type: 'avatar_farda',
  },
  // SIC: Cinza chumbo, Perícia Forense ciano, Crachá prata e Laboratório
  {
    id: 'sic_forensic',
    name: 'Perito Forense (SIC)',
    category: 'fardas',
    cost: 135,
    description: 'Jaleco/Traje de análise criminalística com óculos e crachá prateado do SIC.',
    symbol: '🔬',
    branch: 'SIC',
    organ: 'SIC',
    badgeBg: 'from-cyan-950 via-slate-900 to-slate-950',
    isPopular: true,
    type: 'avatar_farda',
  },
  // SME: Verde esmeralda, Controlo de fronteiras e Teal marítimo/aeroportuário
  {
    id: 'sme_border',
    name: 'Operador de Fronteira (SME)',
    category: 'fardas',
    cost: 130,
    description: 'Traje de inspeção oficial de imigração e segurança fronteiriça.',
    symbol: '🧭',
    branch: 'SME',
    organ: 'SME',
    badgeBg: 'from-emerald-950 via-teal-950 to-slate-950',
    isPopular: true,
    type: 'avatar_farda',
  },
  // SPCB: Vermelho resgate, Chama, Capacete vermelho e Protecção civil
  {
    id: 'spcb_rescue',
    name: 'Resgate de Elite (SPCB)',
    category: 'fardas',
    cost: 140,
    description: 'Traje de bombeiro de alto impacto com capacete vermelho e proteção térmica reforçada.',
    symbol: '🚒',
    branch: 'SPCB',
    organ: 'SPCB',
    badgeBg: 'from-amber-950 via-red-950 to-orange-950',
    isPopular: true,
    type: 'avatar_farda',
  },
  {
    id: 'pna_gala',
    name: 'Farda de Gala PNA (Comando)',
    category: 'fardas',
    cost: 120,
    description: 'Farda Oficial de Gala da Polícia Nacional com insígnias de Comando e águia imperial.',
    symbol: '🦅',
    branch: 'PNA',
    organ: 'PNA',
    badgeBg: 'from-blue-950 via-blue-900 to-indigo-950',
    type: 'avatar_farda',
  },
  {
    id: 'pna_traffic',
    name: 'Oficial de Trânsito PNA',
    category: 'fardas',
    cost: 100,
    description: 'Farda da Polícia de Trânsito e Segurança Rodoviária da Polícia Nacional.',
    symbol: '👮‍♂️',
    branch: 'PNA',
    organ: 'PNA',
    badgeBg: 'from-sky-950 via-blue-900 to-slate-900',
    type: 'avatar_farda',
  },
  {
    id: 'sic_tactical',
    name: 'Farda Táctica SIC (Elite)',
    category: 'fardas',
    cost: 120,
    description: 'Uniforme de Investigação Criminal de Elite com colete táctico e crachá metálico.',
    symbol: '🕵️‍♂️',
    branch: 'SIC',
    organ: 'SIC',
    badgeBg: 'from-slate-950 via-neutral-900 to-slate-900',
    isPopular: true,
    type: 'avatar_farda',
  },
  {
    id: 'sme_airport',
    name: 'Farda Aeroportuária SME',
    category: 'fardas',
    cost: 120,
    description: 'Uniforme Oficial de Controlo e Segurança de Fronteiras do SME.',
    symbol: '🛂',
    branch: 'SME',
    organ: 'SME',
    badgeBg: 'from-teal-950 via-emerald-900 to-slate-900',
    type: 'avatar_farda',
  },
  {
    id: 'sp_honor',
    name: 'Farda de Honra SP',
    category: 'fardas',
    cost: 120,
    description: 'Traje Oficial de Cerimónia e Alto Comando do Serviço Penitenciário.',
    symbol: '🦺',
    branch: 'SP',
    organ: 'SP',
    badgeBg: 'from-purple-950 via-slate-900 to-slate-950',
    type: 'avatar_farda',
  },
  {
    id: 'minint_commissar',
    name: 'Farda Dourada Comissário-Geral',
    category: 'fardas',
    cost: 300,
    description: 'Uniforme Supremo do Ministério do Interior com coroa dourada e brilho lendário.',
    symbol: '👑',
    badgeBg: 'from-amber-700 via-yellow-600 to-amber-900',
    isExclusive: true,
    type: 'avatar_farda',
  },

  // 2. Pins e Distintivos Especiais dos Ramos (Badges & Pins)
  {
    id: 'pna_2',
    name: 'Escudo Dourado PNA',
    category: 'badges',
    cost: 80,
    description: 'Emblema Dourado comemorativo da Polícia Nacional de Angola.',
    symbol: '🛡️',
    branch: 'PNA',
    organ: 'PNA',
    badgeBg: 'from-blue-950 via-indigo-950 to-amber-950',
    type: 'badge',
  },
  {
    id: 'sic_2',
    name: 'Crachá Prata SIC',
    category: 'badges',
    cost: 80,
    description: 'Distintivo metálico prateado de Agente Operativo do SIC.',
    symbol: '🛡️',
    branch: 'SIC',
    organ: 'SIC',
    badgeBg: 'from-slate-800 via-slate-900 to-slate-950',
    type: 'badge',
  },
  {
    id: 'sme_2',
    name: 'Selo Fronteiriço SME',
    category: 'badges',
    cost: 80,
    description: 'Emblema Internacional de Segurança e Fiscalização Migratória.',
    symbol: '🌐',
    branch: 'SME',
    organ: 'SME',
    badgeBg: 'from-emerald-950 via-teal-900 to-slate-950',
    type: 'pin',
  },
  {
    id: 'sp_2',
    name: 'Balança de Justiça SP',
    category: 'badges',
    cost: 80,
    description: 'Insígnia da Balança da Justiça e Reabilitação do Serviço Penitenciário.',
    symbol: '⚖️',
    branch: 'SP',
    organ: 'SP',
    badgeBg: 'from-slate-900 via-purple-950 to-zinc-950',
    type: 'badge',
  },
  {
    id: 'spcb_2',
    name: 'Chama de Protecção SPCB',
    category: 'badges',
    cost: 80,
    description: 'Distintivo de Prontidão e Socorro do Corpo de Bombeiros.',
    symbol: '🔥',
    branch: 'SPCB',
    organ: 'SPCB',
    badgeBg: 'from-red-950 via-orange-950 to-amber-900',
    type: 'badge',
  },
  {
    id: 'minint_instrutor',
    name: 'Instrutor de Academia MININT',
    category: 'badges',
    cost: 150,
    description: 'Insígnia Especial de Formador e Mestre de Preparação Académica do MININT.',
    symbol: '🎓',
    branch: 'MININT',
    organ: 'MININT',
    badgeBg: 'from-indigo-950 via-slate-900 to-amber-950',
    isExclusive: true,
    type: 'pin',
  },

  // 3. Congelamento de Sequência (Streak Freeze)
  {
    id: 'streak_freeze',
    name: 'Congelamento de Sequência (Streak Freeze)',
    category: 'streak',
    cost: 100,
    description: 'Protege a sua ofensiva diária de estudo! Se falhar 1 dia sem estudar, a sua sequência não será zerada.',
    symbol: '🧊',
    badgeBg: 'from-sky-500 via-blue-600 to-cyan-700',
    isPopular: true,
    type: 'streak_freeze',
    amount: 1,
  },

  // 4. Dicas Extra (Power-ups 50:50)
  {
    id: 'hint_pack_3',
    name: 'Pacote 3x Dicas Extra (50:50)',
    category: 'powerups',
    cost: 50,
    description: 'Elimina instantaneamente 2 opções erradas em qualquer questão nos simulados de estudo.',
    symbol: '⚡',
    badgeBg: 'from-purple-600 via-indigo-600 to-purple-800',
    isPopular: true,
    type: 'hint_powerup',
    amount: 3,
  },
  {
    id: 'hint_pack_10',
    name: 'Pacote 10x Dicas Extra (Super Lote)',
    category: 'powerups',
    cost: 140,
    description: 'Pacote económico com 10 dicas 50:50 para dominar os simulados mais exigentes do MININT.',
    symbol: '🔮',
    badgeBg: 'from-purple-700 via-purple-900 to-indigo-950',
    isExclusive: true,
    type: 'hint_powerup',
    amount: 10,
  },

  // 5. Boosters
  {
    id: 'duel_xp_boost',
    name: 'Booster XP Duplo (1 Hora)',
    category: 'boosters',
    cost: 80,
    description: 'Multiplica por 2x todo o XP obtido em simulados e duelos 1v1 durante 60 minutos.',
    symbol: '🚀',
    badgeBg: 'from-orange-500 via-amber-600 to-red-600',
    type: 'xp_booster',
    amount: 1,
  },
];

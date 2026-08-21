import { BranchInfo, MININTBranch } from '../types';
import { BASE_AVATARS, AvatarDefinition, getAvatarById, getAvatarAssetPath, getAvatarsByOrgan } from './avatars';

export type BaseOfficialAvatar = AvatarDefinition;
export const BASE_OFFICIAL_AVATARS: AvatarDefinition[] = BASE_AVATARS;
export { BASE_AVATARS, getAvatarById, getAvatarAssetPath, getAvatarsByOrgan };

export const MININT_BRANCHES: Record<MININTBranch, BranchInfo> = {
  PNA: {
    id: 'PNA',
    name: 'Polícia Nacional',
    fullName: 'Polícia Nacional de Angola (PNA)',
    motto: 'Pela Ordem e Pela Paz',
    color: '#1e40af', // Blue
    badgeBg: 'from-blue-900/80 to-blue-950/90',
    accentColor: '#3b82f6',
    description: 'Força paramilitar incumbida de garantir a ordem e segurança pública, protecção de pessoas e bens.',
    iconName: 'Shield',
    avatarSvg: 'pna_shield'
  },
  SIC: {
    id: 'SIC',
    name: 'Investigação Criminal',
    fullName: 'Serviço de Investigação Criminal (SIC)',
    motto: 'Veritas et Justitia',
    color: '#0f172a', // Dark Navy/Steel
    badgeBg: 'from-slate-800/80 to-slate-950/90',
    accentColor: '#94a3b8',
    description: 'Órgão executivo do MININT encarregado de investigar e combater a criminalidade e promover acções penais.',
    iconName: 'Search',
    avatarSvg: 'sic_badge'
  },
  SME: {
    id: 'SME',
    name: 'Migração e Estrangeiros',
    fullName: 'Serviço de Migração e Estrangeiros (SME)',
    motto: 'Controlo e Segurança Fronteiriça',
    color: '#065f46', // Emerald
    badgeBg: 'from-emerald-900/80 to-emerald-950/90',
    accentColor: '#10b981',
    description: 'Controla a entrada, permanência, trânsito e saída de cidadãos nacionais e estrangeiros das fronteiras.',
    iconName: 'Globe',
    avatarSvg: 'sme_passport'
  },
  SP: {
    id: 'SP',
    name: 'Serviço Penitenciário',
    fullName: 'Serviço Penitenciário (SP)',
    motto: 'Reabilitação e Justiça',
    color: '#831843', // Crimson / Wine
    badgeBg: 'from-rose-900/80 to-rose-950/90',
    accentColor: '#f43f5e',
    description: 'Garante a execução das penas privativas de liberdade e a reabilitação/reintegração social dos reclusos.',
    iconName: 'Lock',
    avatarSvg: 'sp_emblem'
  },
  SPCB: {
    id: 'SPCB',
    name: 'Protecção Civil e Bombeiros',
    fullName: 'Serviço de Protecção Civil e Bombeiros (SPCB)',
    motto: 'Vida e Património',
    color: '#991b1b', // Fire Red
    badgeBg: 'from-amber-900/80 to-red-950/90',
    accentColor: '#ef4444',
    description: 'Prevenção de riscos, socorro, protecção civil, combate a incêndios e apoio em calamidades naturais.',
    iconName: 'Flame',
    avatarSvg: 'spcb_flame'
  }
};

export const PROVINCES_ANGOLA = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cubango',
  'Cunene',
  'Huambo',
  'Huíla',
  'Ícolo e Bengo',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Moxico-Leste',
  'Namibe',
  'Uíge',
  'Zaire'
];

export const normalizeProvinceName = (province?: string): string => {
  if (!province) return '';
  return province
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .toLowerCase();
};

export const RANKS_MININT = [
  { level: 1, title: 'Candidato Recruta', minXp: 0, badge: '🔰' },
  { level: 2, title: 'Agente de 3.ª Classe', minXp: 150, badge: '🎖️' },
  { level: 3, title: 'Agente de 2.ª Classe', minXp: 400, badge: '🎗️' },
  { level: 4, title: 'Agente de 1.ª Classe', minXp: 800, badge: '🥉' },
  { level: 5, title: 'Subinspector', minXp: 1500, badge: '🥈' },
  { level: 6, title: 'Inspector', minXp: 2500, badge: '🥇' },
  { level: 7, title: 'Chief Inspector', minXp: 4000, badge: '⭐' },
  { level: 8, title: 'Superintendente', minXp: 6000, badge: '🌟' },
  { level: 9, title: 'Comissário-Geral', minXp: 10000, badge: '👑' }
];

export const getCandidateInitials = (displayName?: string): string => {
  if (!displayName) return 'CM';
  const clean = displayName.trim().replace(/\s+/g, ' ');
  if (!clean) return 'CM';
  const parts = clean.split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return 'CM';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
};

export const BASIC_FREE_AVATARS = [
  'pna_male',
  'pna_female',
  'sic_male',
  'sic_female',
  'sme_male',
  'sme_female',
  'spcb_male',
  'spcb_female',
  'sp_male',
  'sp_female',
  'pna_1',
  'sic_1',
  'sme_1',
  'sp_1',
  'spcb_1',
  'custom_initials'
];

export const AVATAR_OPTIONS = [
  // 1. 10 Base Official Avatars (Male & Female for each Branch)
  // PNA
  { id: 'pna_male', branch: 'PNA' as MININTBranch, label: 'PNA - Agente Masculino', symbol: '👮‍♂️' },
  { id: 'pna_female', branch: 'PNA' as MININTBranch, label: 'PNA - Agente Feminina', symbol: '👮‍♀️' },
  // SIC
  { id: 'sic_male', branch: 'SIC' as MININTBranch, label: 'SIC - Investigador', symbol: '🕵️‍♂️' },
  { id: 'sic_female', branch: 'SIC' as MININTBranch, label: 'SIC - Investigadora', symbol: '🕵️‍♀️' },
  // SME
  { id: 'sme_male', branch: 'SME' as MININTBranch, label: 'SME - Agente Masculino', symbol: '🛂' },
  { id: 'sme_female', branch: 'SME' as MININTBranch, label: 'SME - Agente Feminina', symbol: '🛂' },
  // SPCB
  { id: 'spcb_male', branch: 'SPCB' as MININTBranch, label: 'SPCB - Bombeiro', symbol: '🧑‍🚒' },
  { id: 'spcb_female', branch: 'SPCB' as MININTBranch, label: 'SPCB - Bombeira', symbol: '👩‍🚒' },
  // SP
  { id: 'sp_male', branch: 'SP' as MININTBranch, label: 'SP - Agente Masculino', symbol: '⚖️' },
  { id: 'sp_female', branch: 'SP' as MININTBranch, label: 'SP - Agente Feminina', symbol: '⚖️' },

  // Legacy mappings for backward compatibility
  { id: 'pna_1', branch: 'PNA' as MININTBranch, label: 'Oficial PNA', symbol: '👮‍♂️' },
  { id: 'sic_1', branch: 'SIC' as MININTBranch, label: 'Oficial SIC', symbol: '🕵️‍♂️' },
  { id: 'sme_1', branch: 'SME' as MININTBranch, label: 'Oficial SME', symbol: '🛂' },
  { id: 'sp_1', branch: 'SP' as MININTBranch, label: 'Oficial SP', symbol: '⚖️' },
  { id: 'spcb_1', branch: 'SPCB' as MININTBranch, label: 'Oficial SPCB', symbol: '🧑‍🚒' },
  { id: 'custom_initials', branch: 'Personalizado' as any, label: 'Avatar Personalizado', symbol: '👤', isCustomInitials: true },

  // 2. Special & Themed Shop Fardas (Lockable)
  // PNA
  { id: 'pna_pir', branch: 'PNA' as MININTBranch, label: 'Farda Tática PIR (PNA)', symbol: '💂‍♂️', isSpecialShopItem: true },
  { id: 'pna_pir_tactical', branch: 'PNA' as MININTBranch, label: 'Farda Tática PIR (PNA)', symbol: '💂‍♂️', isSpecialShopItem: true },
  { id: 'pna_gala', branch: 'PNA' as MININTBranch, label: 'Farda de Gala PNA (Comando)', symbol: '🦅', isSpecialShopItem: true },
  { id: 'pna_intervencao', branch: 'PNA' as MININTBranch, label: 'Operativo PIR (Intervenção)', symbol: '👮‍♂️', isSpecialShopItem: true },
  { id: 'pna_traffic', branch: 'PNA' as MININTBranch, label: 'Oficial de Trânsito PNA', symbol: '👮‍♂️', isSpecialShopItem: true },
  { id: 'pna_transito', branch: 'PNA' as MININTBranch, label: 'Oficial de Trânsito PNA', symbol: '👮‍♂️', isSpecialShopItem: true },
  { id: 'pna_2', branch: 'PNA' as MININTBranch, label: 'Escudo Dourado PNA', symbol: '🛡️', isSpecialShopItem: true },

  // SIC
  { id: 'sic_forensic', branch: 'SIC' as MININTBranch, label: 'Perito Forense (SIC)', symbol: '🔬', isSpecialShopItem: true },
  { id: 'sic_forensic_expert', branch: 'SIC' as MININTBranch, label: 'Perito Forense (SIC)', symbol: '🔬', isSpecialShopItem: true },
  { id: 'sic_tactical', branch: 'SIC' as MININTBranch, label: 'Farda Táctica SIC (Elite)', symbol: '🕵️‍♂️', isSpecialShopItem: true },
  { id: 'sic_perito', branch: 'SIC' as MININTBranch, label: 'Perito Criminalística SIC', symbol: '🔬', isSpecialShopItem: true },
  { id: 'sic_2', branch: 'SIC' as MININTBranch, label: 'Crachá Prata SIC', symbol: '🛡️', isSpecialShopItem: true },

  // SME
  { id: 'sme_border', branch: 'SME' as MININTBranch, label: 'Operador de Fronteira (SME)', symbol: '🧭', isSpecialShopItem: true },
  { id: 'sme_border_operator', branch: 'SME' as MININTBranch, label: 'Operador de Fronteira (SME)', symbol: '🧭', isSpecialShopItem: true },
  { id: 'sme_airport', branch: 'SME' as MININTBranch, label: 'Farda Aeroportuária SME', symbol: '🛂', isSpecialShopItem: true },
  { id: 'sme_frontier', branch: 'SME' as MININTBranch, label: 'Farda Aeroportuária SME', symbol: '🛂', isSpecialShopItem: true },
  { id: 'sme_2', branch: 'SME' as MININTBranch, label: 'Selo Fronteiriço SME', symbol: '🌐', isSpecialShopItem: true },

  // SP
  { id: 'sp_honor', branch: 'SP' as MININTBranch, label: 'Farda de Honra SP', symbol: '🦺', isSpecialShopItem: true },
  { id: 'sp_honra', branch: 'SP' as MININTBranch, label: 'Farda de Honra SP', symbol: '🦺', isSpecialShopItem: true },
  { id: 'sp_2', branch: 'SP' as MININTBranch, label: 'Balança de Justiça SP', symbol: '⚖️', isSpecialShopItem: true },

  // SPCB
  { id: 'spcb_rescue', branch: 'SPCB' as MININTBranch, label: 'Resgate de Elite (SPCB)', symbol: '🚒', isSpecialShopItem: true },
  { id: 'spcb_elite_rescue', branch: 'SPCB' as MININTBranch, label: 'Resgate de Elite (SPCB)', symbol: '🚒', isSpecialShopItem: true },
  { id: 'spcb_2', branch: 'SPCB' as MININTBranch, label: 'Chama de Protecção', symbol: '🔥', isSpecialShopItem: true },

  // MININT Geral / Lendários
  { id: 'minint_instrutor', branch: 'Personalizado' as any, label: 'Instrutor de Academia MININT', symbol: '🎓', isSpecialShopItem: true },
  { id: 'minint_commissar', branch: 'Personalizado' as any, label: 'Farda Dourada Comissário-Geral', symbol: '👑', isSpecialShopItem: true },
  { id: 'minint_gala_gold', branch: 'Personalizado' as any, label: 'Farda Dourada Comissário-Geral', symbol: '👑', isSpecialShopItem: true },
];

export const getAvatarOption = (
  avatarId?: string,
  branch?: MININTBranch,
  displayName?: string,
  gender?: 'female' | 'male' | string
) => {
  if (avatarId === 'custom_initials') {
    const initials = getCandidateInitials(displayName);
    return {
      id: 'custom_initials',
      branch: (branch || 'PNA') as MININTBranch,
      label: `Oficial ${branch || 'PNA'}`,
      symbol: initials,
      isCustomInitials: true,
    };
  }

  const resolvedGender = gender === 'female' || (typeof avatarId === 'string' && avatarId.toLowerCase().includes('female')) ? 'female' : (gender === 'male' ? 'male' : undefined);

  if (avatarId) {
    if (resolvedGender === 'female' && (avatarId.endsWith('_male') || avatarId.endsWith('_1'))) {
      const cleanBranch = avatarId.split('_')[0].toLowerCase();
      const femaleId = `${cleanBranch}_female`;
      const foundFemale = AVATAR_OPTIONS.find(a => a.id === femaleId);
      if (foundFemale) return foundFemale;
    }
    const found = AVATAR_OPTIONS.find(a => a.id === avatarId);
    if (found) return found;
  }

  if (branch) {
    if (resolvedGender === 'female') {
      const femaleId = `${branch.toLowerCase()}_female`;
      const foundFemale = AVATAR_OPTIONS.find(a => a.id === femaleId);
      if (foundFemale) return foundFemale;
    }
    const foundBranchAvatar = AVATAR_OPTIONS.find(a => a.branch === branch);
    if (foundBranchAvatar) return foundBranchAvatar;
  }

  if (resolvedGender === 'female') {
    return AVATAR_OPTIONS.find(a => a.id === 'pna_female') || AVATAR_OPTIONS[0];
  }

  return AVATAR_OPTIONS[0];
};


import { BranchInfo, MININTBranch } from '../types';

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

export const AVATAR_OPTIONS = [
  { id: 'pna_1', branch: 'PNA' as MININTBranch, label: 'Oficial PNA', symbol: '👮‍♂️' },
  { id: 'pna_2', branch: 'PNA' as MININTBranch, label: 'Escudo Dourado PNA', symbol: '🛡️' },
  { id: 'sic_1', branch: 'SIC' as MININTBranch, label: 'Oficial SIC', symbol: '🕵️‍♂️' },
  { id: 'sic_2', branch: 'SIC' as MININTBranch, label: 'Crachá Prata SIC', symbol: '🔍' },
  { id: 'sme_1', branch: 'SME' as MININTBranch, label: 'Oficial SME', symbol: '🛂' },
  { id: 'sme_2', branch: 'SME' as MININTBranch, label: 'Selo Fronteiriço SME', symbol: '🌐' },
  { id: 'sp_1', branch: 'SP' as MININTBranch, label: 'Oficial SP', symbol: '⚖️' },
  { id: 'sp_2', branch: 'SP' as MININTBranch, label: 'Balança SP', symbol: '🔐' },
  { id: 'spcb_1', branch: 'SPCB' as MININTBranch, label: 'Oficial SPCB', symbol: '🧑‍🚒' },
  { id: 'spcb_2', branch: 'SPCB' as MININTBranch, label: 'Chama de Protecção', symbol: '🔥' },
  { id: 'custom_initials', branch: 'Personalizado' as any, label: 'Avatar Personalizado', symbol: '👤', isCustomInitials: true },
];

export const getAvatarOption = (avatarId?: string, branch?: MININTBranch, displayName?: string) => {
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

  if (avatarId) {
    const found = AVATAR_OPTIONS.find(a => a.id === avatarId);
    if (found) return found;
  }

  if (branch) {
    const foundBranchAvatar = AVATAR_OPTIONS.find(a => a.branch === branch);
    if (foundBranchAvatar) return foundBranchAvatar;
  }

  return AVATAR_OPTIONS[0];
};


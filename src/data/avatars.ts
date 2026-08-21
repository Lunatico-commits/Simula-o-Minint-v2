export interface AvatarBase {
  id: string;
  organ: string;
  gender: 'female' | 'male';
  title: string;
  subtitle: string;
  assetPath: string;
  accentColor: string;
}

export type AvatarDefinition = AvatarBase;

export const avatarsList: AvatarBase[] = [
  {
    id: "pna_female",
    organ: "PNA",
    gender: "female",
    title: "PNA - Agente Feminina",
    subtitle: "Polícia Nacional de Angola",
    assetPath: "/avatars/pna_female.png",
    accentColor: "#1E3A8A"
  },
  {
    id: "pna_male",
    organ: "PNA",
    gender: "male",
    title: "PNA - Agente Masculino",
    subtitle: "Polícia Nacional de Angola",
    assetPath: "/avatars/pna_male.png",
    accentColor: "#1E3A8A"
  },
  {
    id: "sic_female",
    organ: "SIC",
    gender: "female",
    title: "SIC - Investigadora",
    subtitle: "Serviço de Investigação Criminal",
    assetPath: "/avatars/sic_female.png",
    accentColor: "#111827"
  },
  {
    id: "sic_male",
    organ: "SIC",
    gender: "male",
    title: "SIC - Investigador",
    subtitle: "Serviço de Investigação Criminal",
    assetPath: "/avatars/sic_male.png",
    accentColor: "#111827"
  },
  {
    id: "sme_female",
    organ: "SME",
    gender: "female",
    title: "SME - Agente Feminina",
    subtitle: "Serviço de Migração e Estrangeiros",
    assetPath: "/avatars/sme_female.png",
    accentColor: "#D97706"
  },
  {
    id: "sme_male",
    organ: "SME",
    gender: "male",
    title: "SME - Agente Masculino",
    subtitle: "Serviço de Migração e Estrangeiros",
    assetPath: "/avatars/sme_male.png",
    accentColor: "#D97706"
  },
  {
    id: "spcb_female",
    organ: "SPCB",
    gender: "female",
    title: "SPCB - Bombeira",
    subtitle: "Protecção Civil e Bombeiros",
    assetPath: "/avatars/spcb_female.png",
    accentColor: "#DC2626"
  },
  {
    id: "spcb_male",
    organ: "SPCB",
    gender: "male",
    title: "SPCB - Bombeiro",
    subtitle: "Protecção Civil e Bombeiros",
    assetPath: "/avatars/spcb_male.png",
    accentColor: "#DC2626"
  },
  {
    id: "sp_female",
    organ: "SP",
    gender: "female",
    title: "SP - Agente Feminina",
    subtitle: "Serviço Penitenciário",
    assetPath: "/avatars/sp_female.png",
    accentColor: "#15803D"
  },
  {
    id: "sp_male",
    organ: "SP",
    gender: "male",
    title: "SP - Agente Masculino",
    subtitle: "Serviço Penitenciário",
    assetPath: "/avatars/sp_male.png",
    accentColor: "#15803D"
  }
];

export const BASE_AVATARS: AvatarBase[] = avatarsList;

export const AVATAR_MAP: Record<string, AvatarBase> = avatarsList.reduce(
  (acc, avatar) => {
    acc[avatar.id] = avatar;
    return acc;
  },
  {} as Record<string, AvatarBase>
);

export const getAvatarById = (id?: string): AvatarBase | undefined => {
  if (!id) return undefined;
  return AVATAR_MAP[id];
};

export type AvatarGender = 'female' | 'male';

/**
 * Detecta o género do utilizador com base no perfil ou ID do avatar.
 */
export const getUserGender = (profileOrAvatarId?: { avatarId?: string; gender?: string } | string): AvatarGender => {
  if (!profileOrAvatarId) return 'male';
  if (typeof profileOrAvatarId === 'string') {
    return profileOrAvatarId.toLowerCase().includes('female') ? 'female' : 'male';
  }
  if (profileOrAvatarId.gender === 'female' || profileOrAvatarId.avatarId?.toLowerCase().includes('female')) {
    return 'female';
  }
  return 'male';
};

/**
 * Normaliza os IDs de fardas/avatares para a sua forma canónica única.
 */
export const normalizeUniformId = (id?: string): string => {
  if (!id) return 'pna';
  const clean = id.trim().toLowerCase();
  
  // Mapeamentos canónicos de fardas da loja
  if (clean === 'pna_pir_tactical' || clean === 'pna_pir_male' || clean === 'pna_pir_female' || clean === 'pna_intervencao') return 'pna_pir';
  if (clean === 'sic_forensic_expert' || clean === 'sic_forensic_male' || clean === 'sic_forensic_female' || clean === 'sic_forensic' || clean === 'sic_perito') return 'sic_forensic';
  if (clean === 'sme_border_operator' || clean === 'sme_border_male' || clean === 'sme_border_female' || clean === 'sme_border') return 'sme_border';
  if (clean === 'spcb_elite_rescue' || clean === 'spcb_rescue_male' || clean === 'spcb_rescue_female' || clean === 'spcb_rescue') return 'spcb_rescue';
  if (clean === 'pna_gala' || clean === 'pna_gala_male' || clean === 'pna_gala_female') return 'pna_gala';
  if (clean === 'pna_transito' || clean === 'pna_traffic_male' || clean === 'pna_traffic_female' || clean === 'pna_traffic') return 'pna_traffic';
  if (clean === 'sic_tactical' || clean === 'sic_tactical_male' || clean === 'sic_tactical_female') return 'sic_tactical';
  if (clean === 'sme_frontier' || clean === 'sme_airport_male' || clean === 'sme_airport_female' || clean === 'sme_airport') return 'sme_airport';
  if (clean === 'sp_honra' || clean === 'sp_honor_male' || clean === 'sp_honor_female' || clean === 'sp_honor') return 'sp_honor';
  if (clean === 'minint_gala_gold' || clean === 'minint_commissar' || clean === 'minint_commissar_male' || clean === 'minint_commissar_female') return 'minint_commissar';
  
  // Órgãos base
  if (clean === 'pna' || clean === 'pna_1' || clean === 'pna_male' || clean === 'pna_female') return 'pna';
  if (clean === 'sic' || clean === 'sic_1' || clean === 'sic_male' || clean === 'sic_female') return 'sic';
  if (clean === 'sme' || clean === 'sme_1' || clean === 'sme_male' || clean === 'sme_female') return 'sme';
  if (clean === 'spcb' || clean === 'spcb_1' || clean === 'spcb_male' || clean === 'spcb_female') return 'spcb';
  if (clean === 'sp' || clean === 'sp_1' || clean === 'sp_male' || clean === 'sp_female') return 'sp';

  // Remove sufixos explícitos
  if (clean.endsWith('_male')) return clean.slice(0, -5);
  if (clean.endsWith('_female')) return clean.slice(0, -7);

  return clean;
};

/**
 * Obtém o caminho da imagem de avatar considerando o género do utilizador.
 * Nomenclatura padrão:
 * - Se gender === 'female' -> '/avatars/{itemId}_female.png'
 * - Se gender === 'male' ou fallback -> '/avatars/{itemId}_male.png'
 */
export const getAvatarImagePath = (
  itemId?: string,
  gender?: 'female' | 'male' | string,
  branch?: string
): string => {
  const targetGender: AvatarGender = gender === 'female' ? 'female' : 'male';

  if (!itemId) {
    const organ = (branch || 'PNA').toLowerCase();
    return `/avatars/${organ}_${targetGender}.png`;
  }

  // Se já for um caminho relativo/absoluto de imagem
  if (itemId.startsWith('/avatars/') && (itemId.endsWith('.png') || itemId.endsWith('.webp'))) {
    if (targetGender === 'female' && itemId.includes('_male.')) {
      return itemId.replace('_male.', '_female.');
    }
    if (targetGender === 'male' && itemId.includes('_female.')) {
      return itemId.replace('_female.', '_male.');
    }
    return itemId;
  }

  const baseId = normalizeUniformId(itemId);
  return `/avatars/${baseId}_${targetGender}.png`;
};

export const getAvatarAssetPath = (id?: string, branch?: string, gender?: 'female' | 'male'): string => {
  if (id && AVATAR_MAP[id]) {
    return AVATAR_MAP[id].assetPath;
  }
  const resolvedGender = gender || (id?.includes('female') ? 'female' : 'male');
  return getAvatarImagePath(id, resolvedGender, branch);
};

export const getAvatarsByOrgan = (organ: string): AvatarBase[] => {
  return avatarsList.filter(a => a.organ.toUpperCase() === organ.toUpperCase());
};

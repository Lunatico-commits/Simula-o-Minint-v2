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

export const getAvatarAssetPath = (id?: string, branch?: string): string => {
  if (id && AVATAR_MAP[id]) {
    return AVATAR_MAP[id].assetPath;
  }
  
  // Backward compatibility mappings
  if (id) {
    if (id === 'pna_pir_tactical' || id === 'pna_pir_male') return '/avatars/pna_pir_male.png';
    if (id === 'pna_1' || id === 'pna_male') return '/avatars/pna_male.png';
    if (id === 'pna_female') return '/avatars/pna_female.png';
    if (id === 'sic_1' || id === 'sic_male') return '/avatars/sic_male.png';
    if (id === 'sic_female') return '/avatars/sic_female.png';
    if (id === 'sme_1' || id === 'sme_male') return '/avatars/sme_male.png';
    if (id === 'sme_female') return '/avatars/sme_female.png';
    if (id === 'spcb_1' || id === 'spcb_male') return '/avatars/spcb_male.png';
    if (id === 'spcb_female') return '/avatars/spcb_female.png';
    if (id === 'sp_1' || id === 'sp_male') return '/avatars/sp_male.png';
    if (id === 'sp_female') return '/avatars/sp_female.png';
  }

  // Branch defaults
  switch (branch?.toUpperCase()) {
    case 'SIC':
      return '/avatars/sic_male.png';
    case 'SME':
      return '/avatars/sme_male.png';
    case 'SPCB':
      return '/avatars/spcb_male.png';
    case 'SP':
      return '/avatars/sp_male.png';
    case 'PNA':
    default:
      return '/avatars/pna_male.png';
  }
};

export const getAvatarsByOrgan = (organ: string): AvatarBase[] => {
  return avatarsList.filter(a => a.organ.toUpperCase() === organ.toUpperCase());
};

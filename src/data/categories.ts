import { MININTBranch } from '../types';

/**
 * Identificadores das 5 Matérias Oficiais do Programa do Concurso do MININT
 */
export type OfficialSubjectId = 
  | 'historia_angola'
  | 'organizacao_politica_cra'
  | 'nocoes_administracao_publica'
  | 'legislacao_minint'
  | 'patriotismo_valores_civicos';

export interface SubjectCategoryInfo {
  id: OfficialSubjectId;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  color: string;
  accentColor: string;
  badgeBg: string;
  topics: string[];
}

/**
 * 1. Matérias Oficiais da Prova Escrita (Programa do Edital)
 */
export const OFFICIAL_SUBJECTS: SubjectCategoryInfo[] = [
  {
    id: 'historia_angola',
    name: 'História de Angola',
    shortName: 'História de Angola',
    description: 'Factos históricos, datas marcantes, heróis nacionais e evolução do país',
    iconName: 'Landmark',
    color: '#10B981', // Emerald
    accentColor: '#059669',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    topics: [
      'Resistência Colonial e Reinos Pré-Coloniais (Nzinga Mbandi, Mandume, Ekuikui)',
      'Início da Luta Armada de Libertação Nacional (4 de Fevereiro de 1961)',
      'Acordos de Alvor e Proclamação da Independência Nacional (11 de Novembro de 1975)',
      'Batalha de Cuito Cuanavale e Preservação da Soberania',
      'Acordos de Bicesse, Lusaka e Memorando de Paz do Luena (4 de Abril de 2002)',
      'Primeiro Presidente da República (Dr. António Agostinho Neto)'
    ]
  },
  {
    id: 'organizacao_politica_cra',
    name: 'Organização Política e Administrativa / CRA',
    shortName: 'Org. Política & CRA',
    description: 'Estrutura do Estado, Constituição da República (CRA) e órgãos de soberania',
    iconName: 'Scale',
    color: '#8B5CF6', // Purple
    accentColor: '#7C3AED',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    topics: [
      'Princípios Fundamentais e Direitos Fundamentais na CRA de 2010 e Revisão de 2021',
      'Órgãos de Soberania: Presidente da República, Assembleia Nacional e Tribunais',
      'Poder Judicial, Procuradoria-Geral da República e Conselho Superior da Magistratura',
      'Conselho de Segurança Nacional e Órgãos de Defesa e Segurança',
      'Divisão Político-Administrativa de Angola (21 Províncias, Municípios e Comunas)',
      'Administração Central e Administração Local do Estado'
    ]
  },
  {
    id: 'nocoes_administracao_publica',
    name: 'Noções de Administração Pública',
    shortName: 'Adm. Pública & Ética',
    description: 'Princípios de gestão estatal, probidade pública, ética e deontologia profissional',
    iconName: 'Briefcase',
    color: '#06B6D4', // Cyan
    accentColor: '#0891B2',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    topics: [
      'Princípios da Actividade Administrativa (Legalidade, Imparcialidade, Prossecução do Interesse Público)',
      'Estatuto dos Funcionários Públicos (Lei n.º 26/22 - Lei de Bases da Função Pública)',
      'Deveres, Direitos, Incompatibilidades e Regime Disciplinar na Função Pública',
      'Lei da Probidade Pública (Lei n.º 3/10) e Prevenção da Corrupção',
      'Segredo Profissional, Sigilo Funcional e Hierarquia Administrativa',
      'Ética e Deontologia no Exercício da Autoridade Pública'
    ]
  },
  {
    id: 'legislacao_minint',
    name: 'Legislação e Funcionamento do MININT',
    shortName: 'Leg. MININT & Órgãos',
    description: 'Leis orgânicas, estatutos de carreira e competências específicas dos órgãos executivos',
    iconName: 'ShieldCheck',
    color: '#F59E0B', // Amber
    accentColor: '#D97706',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    topics: [
      'Estatuto Orgânico do Ministério do Interior (Decreto Presidencial n.º 32/18)',
      'Polícia Nacional de Angola (PNA) - Lei n.º 25/20 e Ordem Pública',
      'Serviço de Investigação Criminal (SIC) - Competências de Investigação Penal e Perícia',
      'Serviço de Migração e Estrangeiros (SME) - Controlo de Fronteiras e Regime de Estrangeiros',
      'Serviço de Protecção Civil e Bombeiros (SPCB) - Lei de Bases da Protecção Civil e Socorro',
      'Serviço Penitenciário (SP) - Execução de Penas e Reabilitação Social de Reclusos',
      'Uso da Força, Armas de Fogo e Princípios da Proporcionalidade e Necessidade'
    ]
  },
  {
    id: 'patriotismo_valores_civicos',
    name: 'Patriotismo e Valores Cívicos',
    shortName: 'Patriotismo & Civismo',
    description: 'Símbolos nacionais, deveres cívicos, bandeira, hino nacional e cidadania activa',
    iconName: 'Flag',
    color: '#EF4444', // Red
    accentColor: '#DC2626',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    topics: [
      'Símbolos Nacionais da República de Angola (Bandeira, Insígnia e Hino Nacional "Angola Avante")',
      'Significado das Cores da Bandeira (Vermelho, Preto e Amarelo) e Elementos da Insígnia',
      'Dever de Defesa da Pátria e Fidelidade à Nação',
      'Cidadania Activa, Solidariedade e Respeito pelas Instituições Democráticas',
      'Preservação do Património Público e do Bem Comum',
      'Unidade Nacional, Paz e Coesão Social'
    ]
  }
];

export const OFFICIAL_SUBJECTS_MAP: Record<OfficialSubjectId, SubjectCategoryInfo> = {
  historia_angola: OFFICIAL_SUBJECTS[0],
  organizacao_politica_cra: OFFICIAL_SUBJECTS[1],
  nocoes_administracao_publica: OFFICIAL_SUBJECTS[2],
  legislacao_minint: OFFICIAL_SUBJECTS[3],
  patriotismo_valores_civicos: OFFICIAL_SUBJECTS[4]
};

/**
 * 2. Ramos Executivos do MININT (Filtros de Órgãos)
 */
export interface BranchFilterInfo {
  id: MININTBranch | 'GERAL';
  name: string;
  fullName: string;
  motto: string;
  color: string;
  badgeBg: string;
  description: string;
}

export const MININT_EXECUTIVE_BRANCHES: Record<MININTBranch | 'GERAL', BranchFilterInfo> = {
  PNA: {
    id: 'PNA',
    name: 'PNA',
    fullName: 'Polícia Nacional de Angola',
    motto: 'Pela Ordem e Pela Paz',
    color: '#1E40AF',
    badgeBg: 'from-blue-900/80 to-blue-950/90 text-blue-300 border-blue-500/40',
    description: 'Manutenção da ordem e tranquilidade públicas, segurança das pessoas e bens e policiamento.'
  },
  SIC: {
    id: 'SIC',
    name: 'SIC',
    fullName: 'Serviço de Investigação Criminal',
    motto: 'Veritas et Justitia',
    color: '#334155',
    badgeBg: 'from-slate-800/80 to-slate-950/90 text-slate-300 border-slate-500/40',
    description: 'Investigação criminal, instrução de processos penais, perícia forense e combate ao crime.'
  },
  SME: {
    id: 'SME',
    name: 'SME',
    fullName: 'Serviço de Migração e Estrangeiros',
    motto: 'Controlo e Segurança Fronteiriça',
    color: '#065F46',
    badgeBg: 'from-emerald-900/80 to-emerald-950/90 text-emerald-300 border-emerald-500/40',
    description: 'Fiscalização e controlo da entrada, permanência, trânsito e saída nas fronteiras nacionais.'
  },
  SPCB: {
    id: 'SPCB',
    name: 'SPCB',
    fullName: 'Serviço de Protecção Civil e Bombeiros',
    motto: 'Vida e Património',
    color: '#991B1B',
    badgeBg: 'from-red-900/80 to-red-950/90 text-red-300 border-red-500/40',
    description: 'Prevenção de riscos, combate a incêndios, busca e salvamento e socorro em calamidades.'
  },
  SP: {
    id: 'SP',
    name: 'SP',
    fullName: 'Serviço Penitenciário',
    motto: 'Reabilitação e Justiça',
    color: '#831843',
    badgeBg: 'from-rose-900/80 to-rose-950/90 text-rose-300 border-rose-500/40',
    description: 'Custódia, execução de penas privativas de liberdade e reintegração social de reclusos.'
  },
  GERAL: {
    id: 'GERAL',
    name: 'MININT Geral',
    fullName: 'Ministério do Interior (Geral)',
    motto: 'Segurança e Soberania Nacional',
    color: '#D97706',
    badgeBg: 'from-amber-900/80 to-amber-950/90 text-amber-300 border-amber-500/40',
    description: 'Órgãos centrais, direcções nacionais e matérias comuns a todos os efectivos do MININT.'
  }
};

export interface StudyPDFItem {
  id: string;
  title: string;
  category: 'História' | 'CRA' | 'Admin Pública' | 'Legislação MININT' | 'Patriotismo' | 'Combo Especial';
  description: string;
  priceKz: number;
  pages: string;
  rating: number;
  reviewsCount: number;
  highlights: string[];
  isCombo?: boolean;
  colorTheme: {
    bgGrad: string;
    badgeBg: string;
    border: string;
    textAccent: string;
    iconBg: string;
  };
}

/**
 * 5 Manuais Oficiais Atualizados do MININT + COMBO VIP
 * Total de páginas: 11 + 10 + 9 + 8 + 10 = 48 páginas
 */
export const STUDY_PDFS: StudyPDFItem[] = [
  {
    id: 'pdf_combo_supremo',
    title: 'COMBO VIP: Todos os 5 PDFs + Coletânea de Questões',
    category: 'Combo Especial',
    description: 'Pacote completo alinhado ao edital do MININT (História, CRA, Administração Pública, Legislação e Patriotismo). Inclui todos os 5 manuais em PDF e coletânea especial de questões comentadas.',
    priceKz: 2500,
    pages: '5 LIVROS EM PDF • 48 PÁGINAS NO TOTAL',
    rating: 5.0,
    reviewsCount: 168,
    isCombo: true,
    highlights: [
      '5 Manuais Completos em PDF (48 Páginas no Total)',
      'História de Angola + CRA + Administração Pública',
      'Legislação Orgânica do MININT + Patriotismo e Símbolos',
      'Coletânea Exclusiva de Questões de Exames com Gabarito',
      'Economize comprando o pacote completo com Acesso Vitalício'
    ],
    colorTheme: {
      bgGrad: 'from-amber-500/15 via-amber-600/10 to-yellow-500/15 dark:from-amber-500/20 dark:via-amber-900/30 dark:to-yellow-500/20',
      badgeBg: 'bg-amber-500 text-slate-950 font-black shadow-md',
      border: 'border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      textAccent: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-500 dark:bg-amber-500/30 dark:text-amber-300'
    }
  },
  {
    id: 'pdf_historia_angola',
    title: 'História de Angola (Resumo para Exame)',
    category: 'História',
    description: 'Resumo cronológico e temático da História de Angola para o concurso do MININT: dos Reinos Pré-coloniais à Luta de Libertação, Independência Nacional e Processo de Paz.',
    priceKz: 490,
    pages: '11 PÁGINAS',
    rating: 5.0,
    reviewsCount: 114,
    highlights: [
      'Reinos Pré-coloniais (Kongo, Ndongo, Matamba e Bailundo)',
      'Resistência Anti-colonial e Tratado de Simulambuco',
      'Movimentos de Libertação e 11 de Novembro de 1975',
      'Datas históricas e heróis nacionais frequentes em provas'
    ],
    colorTheme: {
      bgGrad: 'from-rose-500/10 via-slate-800/20 to-orange-600/10',
      badgeBg: 'bg-rose-600 text-white font-bold',
      border: 'border-rose-500/30 dark:border-rose-500/40 hover:border-rose-500',
      textAccent: 'text-rose-500 dark:text-rose-400',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400'
    }
  },
  {
    id: 'pdf_cra_constituicao',
    title: 'Organização Política e Constituição (CRA)',
    category: 'CRA',
    description: 'Estudo esquematizado da Constituição da República de Angola: Direitos, Liberdades e Garantias Fundamentais, Estrutura do Estado, Órgãos de Soberania e Princípios da Segurança Nacional.',
    priceKz: 490,
    pages: '10 PÁGINAS',
    rating: 5.0,
    reviewsCount: 102,
    highlights: [
      'Artigos essenciais da CRA comentados para exame',
      'Direitos, Liberdades e Garantias dos Cidadãos',
      'Órgãos de Soberania: Presidente, Assembleia e Tribunais',
      'Defesa Nacional e Segurança Pública na Constituição'
    ],
    colorTheme: {
      bgGrad: 'from-blue-500/10 via-slate-800/20 to-indigo-600/10',
      badgeBg: 'bg-blue-600 text-white font-bold',
      border: 'border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500',
      textAccent: 'text-blue-500 dark:text-blue-400',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400'
    }
  },
  {
    id: 'pdf_admin_publica_etica',
    title: 'Noções de Administração Pública e Ética',
    category: 'Admin Pública',
    description: 'Conceitos fundamentais da Administração Pública angolana, Princípios da Legalidade e Impessoalidade, Ética e Deontologia Profissional na Função Pública e Regime Disciplinar.',
    priceKz: 490,
    pages: '9 PÁGINAS',
    rating: 4.9,
    reviewsCount: 94,
    highlights: [
      'Princípios Constitucionais da Administração Pública',
      'Deveres, Direitos e Incompatibilidades do Funcionário Público',
      'Ética, Sigilo e Deontologia nas Forças de Segurança',
      'Procedimentos Administrativos e Atendimento ao Cidadão'
    ],
    colorTheme: {
      bgGrad: 'from-emerald-500/10 via-slate-800/20 to-teal-600/10',
      badgeBg: 'bg-emerald-600 text-white font-bold',
      border: 'border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500',
      textAccent: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400'
    }
  },
  {
    id: 'pdf_minint_legislacao_organica',
    title: 'Legislação Orgânica do MININT e seus Ramos Executivos',
    category: 'Legislação MININT',
    description: 'Estrutura orgânica do Ministério do Interior (Decreto Presidencial n.º 152/19). Competências, hierarquia, missões e regime de carreira dos ramos: PNA, SIC, SME, SP e SPCB.',
    priceKz: 490,
    pages: '8 PÁGINAS',
    rating: 4.9,
    reviewsCount: 128,
    highlights: [
      'Decreto Presidencial n.º 152/19 sintetizado e esquematizado',
      'Atribuições detalhadas dos 5 ramos executivos do MININT',
      'Hierarquia policial, patentes e regime disciplinar',
      'Tabelas comparativas para memorização rápida'
    ],
    colorTheme: {
      bgGrad: 'from-amber-500/10 via-slate-800/20 to-yellow-600/10',
      badgeBg: 'bg-amber-600 text-white font-bold',
      border: 'border-amber-500/30 dark:border-amber-500/40 hover:border-amber-500',
      textAccent: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400'
    }
  },
  {
    id: 'pdf_patriotismo_simbolos',
    title: 'Patriotismo, Símbolos Nacionais e Valores Cívicos',
    category: 'Patriotismo',
    description: 'Guia oficial sobre os Símbolos Nacionais de Angola (Bandeira, Insígnia e Hino Nacional - Angola Avante), deveres cívicos, patriotismo e preservação da soberania nacional.',
    priceKz: 490,
    pages: '10 PÁGINAS',
    rating: 5.0,
    reviewsCount: 86,
    highlights: [
      'Significado heráldico e cores da Bandeira Nacional',
      'Insígnia da República e lema nacional',
      'História e letra completa do Hino Nacional (Angola Avante)',
      'Valores cívicos e conduta patriótica para provas'
    ],
    colorTheme: {
      bgGrad: 'from-purple-500/10 via-slate-800/20 to-indigo-600/10',
      badgeBg: 'bg-purple-600 text-white font-bold',
      border: 'border-purple-500/30 dark:border-purple-500/40 hover:border-purple-500',
      textAccent: 'text-purple-500 dark:text-purple-400',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400'
    }
  }
];

export const PDF_CATEGORIES = [
  'Todos',
  'História',
  'CRA',
  'Admin Pública',
  'Legislação MININT',
  'Patriotismo'
] as const;

/**
 * Mapeamento de Ficheiros no Supabase Storage (bucket 'ebooks')
 */
export const EBOOK_FILE_MAP: Record<string, string> = {
  // Combo VIP: combo-vip.zip
  'pdf_combo_supremo': 'combo-vip.zip',

  // PDF 1: História de Angola
  'pdf_historia_angola': 'historia.pdf',
  'pdf_cultura_geral_angola': 'historia.pdf',
  'pdf_cultura_geral_historia': 'historia.pdf',

  // PDF 2: Organização Política e Constituição (CRA)
  'pdf_cra_constituicao': 'constituicao.pdf',
  'pdf_cra_direitos': 'constituicao.pdf',
  'pdf_constituicao_2010': 'constituicao.pdf',

  // PDF 3: Noções de Administração Pública e Ética
  'pdf_admin_publica_etica': 'administracao-publica.pdf',
  'pdf_codigo_penal': 'administracao-publica.pdf',

  // PDF 4: Legislação Orgânica do MININT e seus Ramos Executivos
  'pdf_minint_legislacao_organica': 'lei-organica.pdf',
  'pdf_minint_leis': 'lei-organica.pdf',
  'pdf_regulamento_minint': 'lei-organica.pdf',

  // PDF 5: Patriotismo, Símbolos Nacionais e Valores Cívicos
  'pdf_patriotismo_simbolos': 'patriotismo.pdf',
  'pdf_portugues_gramatica': 'patriotismo.pdf',
  'pdf_portugues_redacao': 'patriotismo.pdf',
  'pdf_informatica_tics': 'patriotismo.pdf'
};

export const EBOOK_VARIANTS: Record<string, string[]> = {
  'pdf_combo_supremo': ['combo-vip.zip', 'combo-vip-minint.zip', 'combo-5-pdfs.zip'],
  'pdf_historia_angola': ['historia.pdf', 'Historia-de-Angola.pdf', 'cultura-geral.pdf'],
  'pdf_cra_constituicao': ['constituicao.pdf', 'Constituicao-CRA.pdf'],
  'pdf_cra_direitos': ['constituicao.pdf', 'Constituicao-CRA.pdf'],
  'pdf_admin_publica_etica': ['administracao-publica.pdf', 'Noções de Administração Pública e Ética.pdf', 'admin-publica.pdf'],
  'pdf_minint_legislacao_organica': ['lei-organica.pdf', 'Lei Organica do MININT e Estatuto Unificado.pdf', 'legislacao-minint.pdf'],
  'pdf_minint_leis': ['lei-organica.pdf', 'Lei Organica do MININT e Estatuto Unificado.pdf'],
  'pdf_patriotismo_simbolos': ['patriotismo.pdf', 'Patriotismo Simbolos Nacionais e Valores Civicos.pdf', 'simbolos-nacionais.pdf']
};

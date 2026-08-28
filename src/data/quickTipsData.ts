export type OfficialSubjectKey = 
  | 'historia_angola'
  | 'direito_constituicao'
  | 'administracao_publica'
  | 'legislacao_minint'
  | 'patriotismo_deveres';

export interface StudyTip {
  id: string;
  category: OfficialSubjectKey;
  categoryLabel: string;
  categoryKey: string;
  topic: string;
  title: string;
  tipText: string;
  lawOrShortcut: string;
  exampleOrExplanation: string;
}

export const OFFICIAL_CATEGORIES: { key: OfficialSubjectKey | 'all'; label: string; shortLabel: string; icon: string }[] = [
  { key: 'all', label: 'Todas as Matérias', shortLabel: 'Todas', icon: 'Sparkles' },
  { key: 'historia_angola', label: 'História de Angola', shortLabel: 'História', icon: 'BookOpen' },
  { key: 'direito_constituicao', label: 'CRA e Organização Política', shortLabel: 'CRA & Política', icon: 'Scale' },
  { key: 'administracao_publica', label: 'Administração Pública', shortLabel: 'Admin Pública', icon: 'Building2' },
  { key: 'legislacao_minint', label: 'Legislação Orgânica do MININT', shortLabel: 'Legislação MININT', icon: 'Shield' },
  { key: 'patriotismo_deveres', label: 'Patriotismo e Deveres do Agente', shortLabel: 'Patriotismo & Deveres', icon: 'Award' },
];

export const DAILY_STUDY_TIPS: StudyTip[] = [
  // 1. HISTÓRIA DE ANGOLA
  {
    id: 'tip_hist_1',
    category: 'historia_angola',
    categoryLabel: 'História de Angola',
    categoryKey: 'historia_angola',
    topic: 'Independência Nacional de 1975',
    title: 'Proclamação da Independência Nacional',
    tipText: 'A Independência da República de Angola foi proclamada a 11 de Novembro de 1975, em Luanda, pelo Dr. António Agostinho Neto, primeiro Presidente de Angola, no Largo 1.º de Maio (actual Praça da Independência).',
    lawOrShortcut: 'Data Histórica: 11 de Novembro de 1975',
    exampleOrExplanation: 'Questão frequente de exame: atente para a data, o proclamador (Agostinho Neto) e o local solene da proclamação na capital do país.'
  },
  {
    id: 'tip_hist_2',
    category: 'historia_angola',
    categoryLabel: 'História de Angola',
    categoryKey: 'historia_angola',
    topic: 'Resistência Anticolonial',
    title: 'A Batalha de Ambuíla (1665)',
    tipText: 'A Batalha de Ambuíla, travada a 29 de Outubro de 1665 entre as forças do Reino do Congo lideradas pelo Rei D. António I (Vita a Nkanga) e o exército colonial português, marcou um momento decisivo na resistência e na história do Reino do Congo.',
    lawOrShortcut: 'Marco Histórico: 29 de Outubro de 1665',
    exampleOrExplanation: 'Os concursos cobram frequentemente as batalhas de resistência e o papel dos soberanos tradicionais na preservação da soberania angolana.'
  },
  {
    id: 'tip_hist_3',
    category: 'historia_angola',
    categoryLabel: 'História de Angola',
    categoryKey: 'historia_angola',
    topic: 'Heroísmo e Liderança Feminina',
    title: 'A Rainha Njinga Mbandi (Reinos do Ndongo e Matamba)',
    tipText: 'A Rainha Njinga Mbandi (1582-1663) destacou-se pela sua genialidade diplomática, visão tática e liderança militar na resistência armada contra a ocupação portuguesa nos séculos XVI e XVII.',
    lawOrShortcut: 'Soberana Histórica: Reinos do Ndongo e Matamba',
    exampleOrExplanation: 'Njinga Mbandi é símbolo de bravura e patriotismo nacional, sendo patrona e referência essencial no estudo da história angolana.'
  },
  {
    id: 'tip_hist_4',
    category: 'historia_angola',
    categoryLabel: 'História de Angola',
    categoryKey: 'historia_angola',
    topic: 'Processo de Paz em Angola',
    title: 'Os Acordos de Paz e o 4 de Abril de 2002',
    tipText: 'O Memorando de Entendimento de Luena (complementar aos Acordos de Bicesse de 1991 e Protocolo de Lusaka de 1994) foi assinado a 4 de Abril de 2002, consagrado oficialmente como o Dia da Paz e da Reconciliação Nacional.',
    lawOrShortcut: 'Feriado Nacional: 4 de Abril (Dia da Paz)',
    exampleOrExplanation: 'Conheça a cronologia: Alvor (1975), Bicesse (1991), Lusaka (1994) e Luena (2002).'
  },
  {
    id: 'tip_hist_5',
    category: 'historia_angola',
    categoryLabel: 'História de Angola',
    categoryKey: 'historia_angola',
    topic: 'Divisão Político-Administrativa',
    title: 'Nova Estrutura Territorial de Angola (Lei n.º 13/24)',
    tipText: 'Com a entrada em vigor da Nova Divisão Político-Administrativa (Lei n.º 13/24), Angola passa a ter 21 Províncias, com a criação das províncias do Moxico Leste (sede em Cazombo), Cuando e Cubango.',
    lawOrShortcut: 'Base Legal: Lei n.º 13/24 (DPA 2025)',
    exampleOrExplanation: 'Tema de máxima actualidade e certeza em provas: saiba o número de províncias (21) e os nomes das novas unidades criadas.'
  },

  // 2. CRA E ORGANIZAÇÃO POLÍTICA
  {
    id: 'tip_cra_1',
    category: 'direito_constituicao',
    categoryLabel: 'CRA e Organização Política',
    categoryKey: 'direito_constituicao',
    topic: 'Princípios Fundamentais da CRA',
    title: 'Forma de Estado e Soberania Nacional',
    tipText: 'Nos termos do Artigo 1.º e 3.º da Constituição da República de Angola (CRA), Angola é uma República soberana, unitária, indivisível, laica e democrática de direito. A soberania é una e indivisível, pertencendo ao Povo.',
    lawOrShortcut: 'Base Legal: Artigos 1.º e 3.º da CRA',
    exampleOrExplanation: 'A soberania popular é exercida pelo sufrágio universal, livre, igual, directo, secreto e periódico através de eleições regulares.'
  },
  {
    id: 'tip_cra_2',
    category: 'direito_constituicao',
    categoryLabel: 'CRA e Organização Política',
    categoryKey: 'direito_constituicao',
    topic: 'Órgãos de Soberania',
    title: 'Tríade dos Órgãos de Soberania de Angola',
    tipText: 'De acordo com o Artigo 108.º da CRA, são órgãos de soberania da República de Angola: o Presidente da República, a Assembleia Nacional e os Tribunais.',
    lawOrShortcut: 'Base Legal: Artigo 108.º da CRA',
    exampleOrExplanation: 'Pegadinha clássica: o Governo/Executivo não é um órgão de soberania isolado; o Chefe do Executivo é o próprio Presidente da República.'
  },
  {
    id: 'tip_cra_3',
    category: 'direito_constituicao',
    categoryLabel: 'CRA e Organização Política',
    categoryKey: 'direito_constituicao',
    topic: 'Garantias dos Direitos e Liberdades',
    title: 'Presunção de Inocência e Proibição de Prisão Arbitrária',
    tipText: 'O Artigo 67.º da CRA determina que qualquer cidadão acusado da prática de um crime presume-se inocente até ao trânsito em julgado da respectiva sentença condenatória.',
    lawOrShortcut: 'Base Legal: Artigo 67.º, n.º 2 da CRA',
    exampleOrExplanation: 'Nenhum cidadão pode ser privado da sua liberdade a não ser nos casos e nos prazos estritamente previstos na Constituição e na lei.'
  },
  {
    id: 'tip_cra_4',
    category: 'direito_constituicao',
    categoryLabel: 'CRA e Organização Política',
    categoryKey: 'direito_constituicao',
    topic: 'Garantias Constitucionais de Defesa',
    title: 'Habeas Corpus e Comunicação Imediata de Prisão',
    tipText: 'O Habeas Corpus (Art. 68.º da CRA) é a garantia judicial urgente contra a prisão ilegal. Além disso, a prisão ou detenção deve ser comunicada à família ou pessoa de confiança no prazo máximo de 24 horas (Art. 64.º, n.º 2).',
    lawOrShortcut: 'Base Legal: Artigos 64.º e 68.º da CRA',
    exampleOrExplanation: 'Artigo essencial para agentes de autoridade: o cumprimento escrupuloso dos prazos legais de notificação evita a nulidade dos autos.'
  },
  {
    id: 'tip_cra_5',
    category: 'direito_constituicao',
    categoryLabel: 'CRA e Organização Política',
    categoryKey: 'direito_constituicao',
    topic: 'Inviolabilidade da Vida Humana',
    title: 'Proibição Constitucional da Pena de Morte',
    tipText: 'O Artigo 30.º da CRA consagra que o Estado respeita e protege a vida da pessoa humana, que é inviolável, sendo expressamente proibida a pena de morte no ordenamento jurídico angolano.',
    lawOrShortcut: 'Base Legal: Artigo 30.º da CRA',
    exampleOrExplanation: 'Fundamento moral e jurídico que vincula todos os agentes de segurança pública ao princípio do uso progressivo e moderado da força.'
  },

  // 3. ADMINISTRAÇÃO PÚBLICA
  {
    id: 'tip_adm_1',
    category: 'administracao_publica',
    categoryLabel: 'Administração Pública',
    categoryKey: 'administracao_publica',
    topic: 'Princípios da Actividade Administrativa',
    title: 'Princípios da Legalidade, Igualdade e Imparcialidade',
    tipText: 'A Administração Pública prossegue o interesse público no respeito pelos direitos e interesses legalmente protegidos dos cidadãos, regendo-se pelos princípios da legalidade, igualdade, proporcionalidade, justiça, imparcialidade e boa-fé.',
    lawOrShortcut: 'Base Legal: Artigo 198.º da CRA',
    exampleOrExplanation: 'O princípio da legalidade administrativa significa que o agente público só pode praticar actos expressamente autorizados ou determinados pela lei.'
  },
  {
    id: 'tip_adm_2',
    category: 'administracao_publica',
    categoryLabel: 'Administração Pública',
    categoryKey: 'administracao_publica',
    topic: 'Teoria do Acto Administrativo',
    title: 'Elementos Essenciais do Acto Administrativo',
    tipText: 'O acto administrativo é a manifestação unilateral de vontade de um órgão competente que visa produzir efeitos jurídicos individuais e concretos. Os seus elementos fundamentais são: competência, objecto, forma, fim e motivação.',
    lawOrShortcut: 'Conceito Jurídico: Acto Administrativo Unilateral',
    exampleOrExplanation: 'A ausência de competência (incompetência absoluta) ou a usurpação de poder acarreta a nulidade total do acto praticado.'
  },
  {
    id: 'tip_adm_3',
    category: 'administracao_publica',
    categoryLabel: 'Administração Pública',
    categoryKey: 'administracao_publica',
    topic: 'Deveres Gerais do Servidor Público',
    title: 'Deveres de Obediência, Lealdade e Sigilo',
    tipText: 'São deveres fundamentais do funcionário público: o dever de obediência hierárquica (salvo se a ordem configurar a prática de crime), lealdade às instituições, sigilo profissional sobre factos reservados e dedicação plena ao serviço.',
    lawOrShortcut: 'Base Legal: Regime Jurídico da Função Pública',
    exampleOrExplanation: 'Atenção às excepções: a ordem ilegal mas não manifestamente criminosa obriga à reclamação escrita prévia por parte do subordinado.'
  },
  {
    id: 'tip_adm_4',
    category: 'administracao_publica',
    categoryLabel: 'Administração Pública',
    categoryKey: 'administracao_publica',
    topic: 'Desconcentração Administrativa',
    title: 'Delegação e Subdelegação de Competências',
    tipText: 'A delegação de competências é o acto pelo qual um órgão normalmente competente para decidir em determinada matéria permite a outro órgão a prática de actos sobre essa mesma matéria, exigindo prévia autorização legal.',
    lawOrShortcut: 'Conceito: Desconcentração de Poderes',
    exampleOrExplanation: 'A delegação transfere o exercício dos poderes e não a respectiva titularidade, podendo o delegante revogar ou avocar a decisão a qualquer momento.'
  },
  {
    id: 'tip_adm_5',
    category: 'administracao_publica',
    categoryLabel: 'Administração Pública',
    categoryKey: 'administracao_publica',
    topic: 'Responsabilidade Administrativa',
    title: 'Responsabilidade Civil do Estado e dos Agentes Públicos',
    tipText: 'O Estado e os seus agentes respondem solidariamente pelos danos causados a terceiros por acções ou omissões ilícitas e culposas no exercício das suas funções públicas, cabendo ao Estado o direito de regresso contra o agente em caso de dolo ou culpa grave.',
    lawOrShortcut: 'Base Legal: Artigo 75.º da CRA',
    exampleOrExplanation: 'Garante aos administrados a indemnização efectiva e desencoraja condutas arbitrárias por parte dos servidores do Estado.'
  },

  // 4. LEGISLAÇÃO ORGÂNICA DOS ÓRGÃOS DO MININT
  {
    id: 'tip_min_1',
    category: 'legislacao_minint',
    categoryLabel: 'Legislação Orgânica do MININT',
    categoryKey: 'legislacao_minint',
    topic: 'Estrutura Orgânica do Ministério',
    title: 'Os 5 Órgãos Executivos Directos do MININT',
    tipText: 'Nos termos do Estatuto Orgânico do Ministério do Interior (Decreto Presidencial n.º 32/18), os 5 Órgãos Executivos Directos são: PNA (Polícia Nacional de Angola), SIC (Serviço de Investigação Criminal), SME (Serviço de Migração e Estrangeiros), SP (Serviço Penitenciário) e SPCB (Serviço de Protecção Civil e Bombeiros).',
    lawOrShortcut: 'Base Legal: Decreto Presidencial n.º 32/18',
    exampleOrExplanation: 'Questão indispensável: decore os nomes e as siglas dos cinco órgãos executivos directos do Ministério do Interior.'
  },
  {
    id: 'tip_min_2',
    category: 'legislacao_minint',
    categoryLabel: 'Legislação Orgânica do MININT',
    categoryKey: 'legislacao_minint',
    topic: 'Polícia Nacional de Angola (PNA)',
    title: 'Natureza e Missão da PNA (Lei n.º 6/20)',
    tipText: 'A PNA é uma instituição policial uniformizada e armada, de natureza civil e com estrutura hierarquizada, que tem por missão garantir a ordem, segurança e tranquilidade públicas, bem como proteger pessoas e bens.',
    lawOrShortcut: 'Base Legal: Lei n.º 6/20 (Lei da PNA)',
    exampleOrExplanation: 'A PNA actua na prevenção e repressão imediata da criminalidade e rege-se pelos princípios da hierarquia e subordinação legal.'
  },
  {
    id: 'tip_min_3',
    category: 'legislacao_minint',
    categoryLabel: 'Legislação Orgânica do MININT',
    categoryKey: 'legislacao_minint',
    topic: 'Serviço de Investigação Criminal (SIC)',
    title: 'Competências e Atribuições do SIC',
    tipText: 'O SIC é o órgão executivo encarregado da investigação criminal, prevenção e combate à criminalidade organizada, branqueamento de capitais e realização da instrução preparatória dos processos-crime sob direcção do Ministério Público.',
    lawOrShortcut: 'Base Legal: Decreto Presidencial n.º 207/14',
    exampleOrExplanation: 'O SIC é um corpo de polícia judiciária especializado com intervenção técnica, científica e pericial nos ilícitos penais.'
  },
  {
    id: 'tip_min_4',
    category: 'legislacao_minint',
    categoryLabel: 'Legislação Orgânica do MININT',
    categoryKey: 'legislacao_minint',
    topic: 'Serviço de Migração e Estrangeiros (SME)',
    title: 'Controlo de Fronteiras e Regime de Vistos (Lei n.º 13/19)',
    tipText: 'O SME tem por missão executar as políticas de controlo e fiscalização da entrada, permanência, trânsito e saída de cidadãos estrangeiros do território nacional, bem como a emissão de passaportes para cidadãos angolanos.',
    lawOrShortcut: 'Base Legal: Lei n.º 13/19 (Regime Jurídico dos Estrangeiros)',
    exampleOrExplanation: 'O SME salvaguarda a integridade das fronteiras aéreas, marítimas, fluviais e terrestres de Angola.'
  },
  {
    id: 'tip_min_5',
    category: 'legislacao_minint',
    categoryLabel: 'Legislação Orgânica do MININT',
    categoryKey: 'legislacao_minint',
    topic: 'Serviço Penitenciário (SP) e SPCB',
    title: 'Reabilitação Prisional e Protecção Civil',
    tipText: 'O SP (Lei n.º 8/08) assegura o internamento e reinserção social de reclusos respeitando a dignidade humana. O SPCB (Lei n.º 28/03) assegura o socorro em catástrofes, extinção de incêndios e protecção civil de pessoas e património.',
    lawOrShortcut: 'Base Legal: Leis n.º 8/08 e 28/03',
    exampleOrExplanation: 'Compreender a finalidade pedagógica da pena (SP) e a prontidão operativa no salvamento e socorro à população (SPCB).'
  },

  // 5. PATRIOTISMO E DEVERES DO AGENTE
  {
    id: 'tip_pat_1',
    category: 'patriotismo_deveres',
    categoryLabel: 'Patriotismo e Deveres do Agente',
    categoryKey: 'patriotismo_deveres',
    topic: 'Símbolos Nacionais de Angola',
    title: 'Composição Heráldica da Bandeira e Insígnia',
    tipText: 'A Bandeira Nacional é composta por duas cores em faixas horizontais: a superior Vermelha (sangue derramado na luta de libertação) e a inferior Preta (o continente africano). No centro figuram a Catana (camponeses e luta armada), a Roda Dentada (operários e indústria) e a Estrela Amarela de cinco pontas (solidariedade internacional e progresso).',
    lawOrShortcut: 'Base Legal: Artigo 18.º da CRA e Anexo I',
    exampleOrExplanation: 'Saiba o significado exacto de cada cor e elemento: o amarelo do emblema central simboliza a riqueza do solo angolano.'
  },
  {
    id: 'tip_pat_2',
    category: 'patriotismo_deveres',
    categoryLabel: 'Patriotismo e Deveres do Agente',
    categoryKey: 'patriotismo_deveres',
    topic: 'Hino Nacional e Civismo',
    title: 'Hino Nacional "Angola Avante" e Amor à Pátria',
    tipText: 'O Hino Nacional "Angola Avante", composto pelo poeta Manuel Rui Alves Monteiro com música de Rui Mingas, é símbolo solene da soberania, devendo ser entoado com respeito em postura de continência e perfilamento cívico.',
    lawOrShortcut: 'Base Legal: Artigo 18.º da CRA e Anexo III',
    exampleOrExplanation: 'O patriotismo exige do agente a valorização e a protecção incondicional dos símbolos da República.'
  },
  {
    id: 'tip_pat_3',
    category: 'patriotismo_deveres',
    categoryLabel: 'Patriotismo e Deveres do Agente',
    categoryKey: 'patriotismo_deveres',
    topic: 'Ética e Deontologia Profissional',
    title: 'Probidade Pública e Tolerância Zero à Corrupção',
    tipText: 'Nos termos da Lei da Probidade Pública (Lei n.º 3/10), o agente público deve pautar a sua conduta pela honestidade, integridade e transparência, sendo terminantemente vedada a solicitação ou recebimento de subornos, gasosas ou vantagens ilícitas.',
    lawOrShortcut: 'Base Legal: Lei n.º 3/10 (Lei da Probidade Pública)',
    exampleOrExplanation: 'A violação do dever de probidade implica responsabilidade criminal por corrupção, demissão por processo disciplinar e inelegibilidade pública.'
  },
  {
    id: 'tip_pat_4',
    category: 'patriotismo_deveres',
    categoryLabel: 'Patriotismo e Deveres do Agente',
    categoryKey: 'patriotismo_deveres',
    topic: 'Doutrina de Intervenção Policial',
    title: 'Princípio do Uso Gradual e Proporcional da Força',
    tipText: 'O recurso a armas de fogo e meios de coerção física é estritamente excepcional, subsidiário e balizado pelos princípios da necessidade, adequação e proporcionalidade, apenas permitido quando esgotados os meios de persuasão e diálogo.',
    lawOrShortcut: 'Doutrina Tática: Uso Progressivo da Força',
    exampleOrExplanation: 'O agente MININT deve priorizar a salvaguarda da vida, agindo sempre com calma, firmeza e respeito à integridade física do cidadão.'
  },
  {
    id: 'tip_pat_5',
    category: 'patriotismo_deveres',
    categoryLabel: 'Patriotismo e Deveres do Agente',
    categoryKey: 'patriotismo_deveres',
    topic: 'Cidadania e Defesa da Pátria',
    title: 'O Dever Sagrado de Defesa da Nação',
    tipText: 'O Artigo 9.º da CRA estabelece que a defesa da Pátria e da soberania nacional é um direito e um dever fundamental de todos os angolanos, cabendo às forças de segurança pública velar pela preservação da ordem constitucional e da paz social.',
    lawOrShortcut: 'Base Legal: Artigo 9.º da CRA',
    exampleOrExplanation: 'O compromisso de honra do candidato MININT fundamenta-se na lealdade à Bandeira Nacional e na protecção do Povo angolano.'
  }
];

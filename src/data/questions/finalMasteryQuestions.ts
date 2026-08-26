import { Question } from '../../types';

export const FINAL_MASTERY_QUESTIONS: Question[] = [
  // --- HISTÓRIA DE ANGOLA (ha_mas_1 a ha_mas_8) ---
  {
    id: 'ha_mas_1',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Em que província angolana localiza-se o monumento do Cuito Cuanavale?',
    options: [
      'Cuando Cubango',
      'Luanda',
      'Moxico',
      'Cunene'
    ],
    correctIndex: 0,
    lawReference: 'Geografia e História Militar de Angola - Memorial do Cuito Cuanavale',
    explanation: 'O município de Cuito Cuanavale situa-se na província do Cuando Cubango.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_mas_2',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Acordo de Lusaka assinado em Novembro de 1994 instituiu em Angola o Governo de:',
    options: [
      'GURN - Governo de Unidade e Reconciliação Nacional',
      'Governo Provisório Colonial',
      'Junta Militar de Salvação',
      'Conselho Revolucionário do Povo'
    ],
    correctIndex: 0,
    lawReference: 'História Política Contemporânea - Protocolo de Lusaka e GURN (1997)',
    explanation: 'O GURN integrou representantes do Governo e dos partidos da oposição na governação e na Assembleia Nacional.',
    difficulty: 'médio'
  },
  {
    id: 'ha_mas_3',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A criação do CVAAR (Corpo Voluntário Angolano de Assistência aos Refugiados) e da OMA no início dos anos 60 teve como propósito histórico:',
    options: [
      'Prestar apoio humanitário, médico, alimentar e logístico aos refugiados e combatentes angolanos além-fronteiras',
      'Assinar tratados comerciais com o governo colonial',
      'Importar mercadorias para os colonos em Luanda',
      'Construir quartéis para o exército português'
    ],
    correctIndex: 0,
    lawReference: 'História do Nacionalismo Angolano - Acção Social e Heroínas da OMA (1962)',
    explanation: 'Organizações humanitárias nacionalistas prestaram auxílio vital aos milhares de angolanos refugiados nos países vizinhos durante a luta armada.',
    difficulty: 'difícil'
  },

  // --- ORGANIZAÇÃO POLÍTICA E CRA (cra_mas_1 a cra_mas_8) ---
  {
    id: 'cra_mas_1',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O Vice-Presidente da República de Angola é:',
    options: [
      'O candidato que figura como número dois da lista nacional do partido político ou coligação de partidos vencedor das Eleições Gerais',
      'Nomeado por sorteio público na rádio',
      'Eleito pelos presidentes das juntas de freguesia',
      'Escolhido pelo Tribunal Constitucional'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 131.º (Vice-Presidente da República)',
    explanation: 'O Vice-Presidente é órgão auxiliar do Chefe de Estado, eleito conjuntamente com o Presidente da República na mesma lista eleitoral.',
    difficulty: 'fácil'
  },
  {
    id: 'cra_mas_2',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é a entidade responsável pela organização, logística e condução material dos processos eleitorais em Angola?',
    options: [
      'CNE - Comissão Nacional Eleitoral',
      'MININT - Ministério do Interior',
      'Tribunal Supremo',
      'Banco Nacional de Angola'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 107.º e Lei Orgânica sobre as Eleições Gerais (Lei n.º 36/11)',
    explanation: 'A CNE é o órgão independente que superintende e conduz os actos eleitorais com isenção e rigor técnico.',
    difficulty: 'médio'
  },
  {
    id: 'cra_mas_3',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Fiscalização Sucessiva Abstrata da Constitucionalidade (Artigo 230.º da CRA) permite ao Tribunal Constitucional:',
    options: [
      'Apreciar e declarar com força obrigatória geral a inconstitucionalidade de quaisquer normas ou leis já em vigor no ordenamento jurídico',
      'Alterar os preços de venda de produtos agrícolas no mercado',
      'Demitir directores de empresas privadas',
      'Substituir o orçamento geral do Estado sem consulta ao executivo'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 230.º (Fiscalização Sucessiva Abstrata da Constitucionalidade)',
    explanation: 'A declaração de inconstitucionalidade com força obrigatória geral expurga do ordenamento as normas contrárias à CRA com efeitos retroactivos.',
    difficulty: 'difícil'
  },

  // --- NOÇÕES DE ADMINISTRAÇÃO PÚBLICA (adm_mas_1 a adm_mas_8) ---
  {
    id: 'adm_mas_1',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O que deve fazer o agente público que detecta um erro involuntário no preenchimento de um requerimento por parte de um cidadão com baixa escolaridade?',
    options: [
      'Orientar cordialmente e prestar assistência técnica para a devida correcção do formulário no local',
      'Rasgar o papel na frente do cidadão e mandá-lo embora',
      'Rir e zombar publicamente da dificuldade da pessoa',
      'Cobrar uma penalização monetária imediata para o seu bolso'
    ],
    correctIndex: 0,
    lawReference: 'Normas do Procedimento Administrativo - Princípio da Colaboração da Administração com os Particulares',
    explanation: 'A Administração tem o dever de cooperação, esclarecimento e apoio contínuo a todos os administrados.',
    difficulty: 'fácil'
  },
  {
    id: 'adm_mas_2',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A figura da "Avocação de Competências" no direito administrativo consiste no acto pelo qual:',
    options: [
      'O órgão superior competente chama a si e decide directamente uma matéria ou processo que estaria normalmente cometida a um órgão subalterno',
      'O funcionário renuncia aos seus direitos sindicais',
      'O ministério transfere todas as suas tarefas para uma ONG',
      'O cidadão anula o seu próprio bilhete de identidade'
    ],
    correctIndex: 0,
    lawReference: 'Decreto-Lei n.º 16-A/95 (Normas do Procedimento Administrativo) - Avocação',
    explanation: 'A avocação é o inverso da delegação, permitindo ao superior decidir pontualmente assunto de competência delegável do subalterno.',
    difficulty: 'médio'
  },
  {
    id: 'adm_mas_3',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O Princípio da Justiça e da Razoabilidade impõe que os actos e regulamentos administrativos:',
    options: [
      'Devam pautar-se pelo bom senso, equidade, ponderação e proporcionalidade, rejeitando soluções aberrantes, desumanas ou manifestamente injustas',
      'Devam ser redigidos exclusivamente em latim arcaico',
      'Possam impor sacrifícios desumanos aos cidadãos sem qualquer fundamento',
      'Sejam aplicados apenas aos fins-de-semana'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 198.º e Normas do Procedimento Administrativo',
    explanation: 'A razoabilidade impede actuações estapafúrdias ou intoleráveis, vinculando a discricionariedade administrativa à justiça material.',
    difficulty: 'difícil'
  },

  // --- LEGISLAÇÃO E MININT RAMOS (min_mas_1 a min_mas_8) ---
  {
    id: 'min_mas_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'No contacto diário com a comunidade, a Polícia de Proximidade da PNA busca:',
    options: [
      'Estreitar laços de confiança e parceria com a população, prevenindo o crime e resolvendo problemas locais em cooperação com as comissões de moradores',
      'Intimidar as crianças nas escolas',
      'Cobrar portagens ilegais nos bairros',
      'Evitar qualquer comunicação com os moradores'
    ],
    correctIndex: 0,
    lawReference: 'Doutrina de Policiamento Comunitário da PNA',
    explanation: 'O policiamento de proximidade humaniza a segurança pública e transforma o cidadão em parceiro activo da paz social.',
    difficulty: 'fácil'
  },
  {
    id: 'min_mas_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Na investigação de homicídios, a Tanatologia Forense desenvolvida pela Criminalística/Medicina Legal do SIC estuda:',
    options: [
      'A causa mortis, o tempo de morte (cronotanatognose) e os mecanismos lesivos que conduziram ao óbito da vítima',
      'O valor de mercado de viaturas roubadas',
      'A velocidade dos ventos na orla marítima',
      'A contabilidade de bancos comerciais'
    ],
    correctIndex: 0,
    lawReference: 'Medicina Legal e Criminalística do SIC',
    explanation: 'A tanatologia forense fornece à justiça laudos científicos irrefutáveis sobre a morte e a dinâmica de agressões.',
    difficulty: 'médio'
  },
  {
    id: 'min_mas_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Visto de Permanência Temporária destina-se ao cidadão estrangeiro que venha a Angola para:',
    options: [
      'Acompanhar o cônjuge titular de visto de trabalho, cumprir estágio profissional ou tratamento médico prolongado',
      'Fixar-se no país sem qualquer justificação de parentesco ou saúde',
      'Trabalhar sem autorização em empresas de exploração de minas',
      'Comandar unidades da polícia nacional'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 - Visto de Permanência Temporária',
    explanation: 'Este visto visa a reunião familiar e assistência de saúde humanitária sem autorizar actividade remunerada directa.',
    difficulty: 'médio'
  },
  {
    id: 'min_mas_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Ao evacuar um edifício durante um incêndio com fumo intenso, qual é o procedimento mais seguro a adoptar?',
    options: [
      'Deslocar-se agachado ou rastejando (pois o ar respirável fica mais próximo ao chão), cobrir o nariz com pano húmido e usar as escadas de emergência (NUNCA os elevadores)',
      'Utilizar os elevadores para descer mais depressa',
      'Correr de pé inalando o fumo negro do tecto',
      'Esconder-se dentro de armários fechados com tranca'
    ],
    correctIndex: 0,
    lawReference: 'Manual de Sobrevivência e Evacuação em Emergências do SPCB',
    explanation: 'O fumo e gases tóxicos sobem por convecção térmica; rastejar reduz drasticamente a inalação de monóxido de carbono.',
    difficulty: 'fácil'
  },
  {
    id: 'min_mas_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O direito à Assistência Religiosa nos estabelecimentos prisionais (Lei n.º 8/08) garante que:',
    options: [
      'O recluso pode professar a sua fé e receber visitas de ministros do seu culto religioso reconhecido pelo Estado, sem qualquer coacção',
      'O recluso é obrigado a converter-se à religião do chefe da guarda prisional',
      'Todas as orações e cultos são expressamente proibidos nos presídios',
      'Apenas os feriados de outras nações são respeitados'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 (Lei Penitenciária) - Liberdade Religiosa nas Prisões',
    explanation: 'O apoio espiritual e moral é componente reconhecida do tratamento penitenciário e da liberdade de consciência.',
    difficulty: 'difícil'
  },

  // --- PATRIOTISMO E VALORES CÍVICOS (pvc_mas_1 a pvc_mas_5) ---
  {
    id: 'pvc_mas_1',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'A Insígnia da República de Angola substitui o que historicamente era denominado no período colonial por:',
    options: [
      'Brasão de Armas Colonial',
      'Moeda de ouro',
      'Farda de gala',
      'Cetro real'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Anexo II e Heráldica da República de Angola',
    explanation: 'A Insígnia da República é o timbre heráldico republicano de Angola independente.',
    difficulty: 'fácil'
  },
  {
    id: 'pvc_mas_2',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O respeito pelos direitos da criança e o combate ao abandono e trabalho infantil em Angola constituem:',
    options: [
      'Prioridade absoluta da família, da sociedade e do Estado nos termos da CRA (Artigo 80.º) e dos 11 Compromissos da Criança',
      'Assunto irrelevante para as forças policiais',
      'Obrigação apenas dos orfanatos particulares',
      'Medida que só entra em vigor após os 18 anos'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 80.º (Infância) e 11 Compromissos da Criança Angolana',
    explanation: 'A protecção integral da criança salvaguarda as futuras gerações e a continuidade próspera da Nação.',
    difficulty: 'médio'
  },
  {
    id: 'pvc_mas_3',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A soberania cultural e a valorização das línguas nacionais no sistema educativo e nos meios de comunicação social (Artigo 19.º da CRA) visam:',
    options: [
      'Preservar a identidade sociocultural de todos os povos de Angola e combater a alienação e aculturação das novas gerações',
      'Impedir o estudo de línguas internacionais',
      'Dividir o país em tribos rivais',
      'Eliminar a escrita formal dos documentos públicos'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 19.º (Línguas Nacionais e Identidade)',
    explanation: 'As línguas nacionais são veículos de património imaterial e sabedoria ancestral de Angola.',
    difficulty: 'difícil'
  }
];

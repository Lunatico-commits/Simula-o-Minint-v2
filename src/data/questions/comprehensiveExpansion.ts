import { Question } from '../../types';

export const COMPREHENSIVE_EXPANSION_QUESTIONS: Question[] = [
  // --- HISTÓRIA DE ANGOLA (ha_comp_1 a ha_comp_10) ---
  {
    id: 'ha_comp_1',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Em que província angolana situa-se a histórica Baixa de Cassanje, palco da revolta camponesa de 1961?',
    options: [
      'Malanje',
      'Luanda',
      'Namibe',
      'Cabinda'
    ],
    correctIndex: 0,
    lawReference: 'Geografia Histórica de Angola - Baixa de Cassanje',
    explanation: 'A Baixa de Cassanje localiza-se na província de Malanje, onde os agricultores se sublevaram contra os abusos da Companhia Geral dos Algodões de Angola (Cotonang).',
    difficulty: 'fácil'
  },
  {
    id: 'ha_comp_2',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'Quem proclamou a célebre frase histórica "O mais importante é resolver os problemas do Povo"?',
    options: [
      'Dr. António Agostinho Neto',
      'Holden Roberto',
      'Rei Mandume',
      'Paulo Dias de Novais'
    ],
    correctIndex: 0,
    lawReference: 'Pensamento Político do Presidente Fundador Dr. António Agostinho Neto',
    explanation: 'Esta máxima sintetizou a orientação humanista e social do primeiro Presidente da República de Angola.',
    difficulty: 'fácil'
  },
  {
    id: 'ha_comp_3',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A primeira constituição de Angola independente, promulgada a 11 de Novembro de 1975, denominava-se:',
    options: [
      'Lei Fundamental da República Popular de Angola (Lei Constitucional de 1975)',
      'Constituição da República de Angola de 2010',
      'Carta Constitucional do Reino de Portugal',
      'Estatuto dos Indígenas de Angola'
    ],
    correctIndex: 0,
    lawReference: 'História Constitucional de Angola - Lei Constitucional de 1975',
    explanation: 'A Lei Constitucional de 1975 estruturou o primeiro Estado soberano e a fundação da República Popular de Angola.',
    difficulty: 'médio'
  },
  {
    id: 'ha_comp_4',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual foi o histórico líder e fundador da UNITA (União Nacional para a Independência Total de Angola)?',
    options: [
      'Jonas Malheiro Savimbi',
      'Holden Roberto',
      'Agostinho Neto',
      'Mário Pinto de Andrade'
    ],
    correctIndex: 0,
    lawReference: 'Nacionalismo Angolano - Movimentos de Libertação',
    explanation: 'Jonas Savimbi fundou a UNITA em Março de 1966 em Muangai (província do Moxico).',
    difficulty: 'médio'
  },
  {
    id: 'ha_comp_5',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O "Estatuto dos Indígenas" (revogado apenas em 1961 pela administração colonial portuguesa) consagrava formalmente:',
    options: [
      'A divisão discriminatória da população entre cidadãos assimilados e indígenas sem plenos direitos de cidadania política e sujeitos a trabalho forçado (chibalo)',
      'A concessão de terras gratuitas para todos os povos bantos',
      'A eleição directa de governadores provinciais angolanos',
      'O ensino superior universal e bilíngue em Kimbundu'
    ],
    correctIndex: 0,
    lawReference: 'História do Direito Colonial - Estatuto dos Indígenas Portugueses das Províncias da Guiné, Angola e Moçambique (1954)',
    explanation: 'O Estatuto do Indigenato foi o instrumento legal de segregação, opressão tributária e exploração de mão-de-obra forçada pelo colonialismo.',
    difficulty: 'difícil'
  },
  {
    id: 'ha_comp_6',
    category: 'historia_angola',
    categoryName: 'História de Angola',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'O memorando de entendimento assinado na cidade do Luena em 30 de Março de 2002 (formalizado a 4 de Abril em Luanda) reuniu as chefias militares de:',
    options: [
      'Forças Armadas Angolanas (FAA) e Forças Militares da UNITA (FMU)',
      'Forças Armadas Portuguesas e Exército Popular de Libertação de Angola',
      'Polícia Militar de Moçambique e Guarda Presidencial de Cuba',
      'Forças de Manutenção de Paz da ONU e Brigadas Internacionais'
    ],
    correctIndex: 0,
    lawReference: 'História da Paz em Angola - Memorando do Luena (2002)',
    explanation: 'O General Armando da Cruz Neto (FAA) e o General Abreu Muengo Ukwachitembo "Kamorteiro" (UNITA) assinaram a declaração de cessar-fogo no Luena.',
    difficulty: 'difícil'
  },

  // --- ORGANIZAÇÃO POLÍTICA E CRA (cra_comp_1 a cra_comp_8) ---
  {
    id: 'cra_comp_1',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'A quem pertence originariamente a Soberania em Angola, nos termos do Artigo 3.º da CRA?',
    options: [
      'Ao Povo, que a exerce através de sufrágio universal, livre, igual, directo, secreto e periódico e pelas formas previstas na Constituição',
      'Exclusivamente aos ministros do governo central',
      'Aos bancos comerciais e empresas multinacionais de petróleo',
      'Aos juízes conselheiros do Tribunal de Contas'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 3.º (Soberania)',
    explanation: 'O princípio da soberania popular estabelece que todo o poder emana do povo e em seu nome é exercido.',
    difficulty: 'fácil'
  },
  {
    id: 'cra_comp_2',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o órgão colegial que apoia o Presidente da República na condução da administração geral e na fixação de políticas públicas executivas?',
    options: [
      'O Conselho de Ministros',
      'A Mesa da Assembleia Nacional',
      'A Comissão Nacional de Eleições',
      'O Conselho Superior de Magistratura'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 134.º (Conselho de Ministros)',
    explanation: 'O Conselho de Ministros é o órgão auxiliar colegial do Presidente da República para o exercício do poder executivo.',
    difficulty: 'médio'
  },
  {
    id: 'cra_comp_3',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Artigo 47.º da CRA consagra o Direito de Reunião e de Manifestação pacífica. O que exige a Constituição para o seu exercício?',
    options: [
      'Não carece de qualquer autorização, exigindo apenas prévia comunicação às autoridades competentes nos termos da lei',
      'Exige autorização prévia e irrevogável do comandante da esquadra de polícia',
      'Exige o pagamento de uma caução em dinheiro no governo provincial',
      'Exige a aprovação de todos os deputados do parlamento'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 47.º (Liberdade de Reunião e de Manifestação)',
    explanation: 'A manifestação pacífica e sem armas é um direito fundamental de exercício livre mediante simples comunicação prévia.',
    difficulty: 'médio'
  },
  {
    id: 'cra_comp_4',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A garantia constitucional do "Juiz Natural" (Artigo 72.º da CRA) determina que:',
    options: [
      'Nenhuma causa pode ser subtraída ao tribunal cuja competência esteja previamente fixada em lei anterior, sendo expressamente proibidos tribunais de excepção',
      'O juiz pode ser escolhido livremente pelo arguido no dia do julgamento',
      'O réu pode ser julgado pelo comandante de polícia do seu bairro',
      'Os tribunais podem ser criados após o cometimento do crime para julgar um caso específico'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 72.º e Artigo 174.º (Princípio do Juiz Natural)',
    explanation: 'O princípio do juiz natural é uma garantia processual indispensável contra arbitrariedades judiciais e tribunais de encomenda.',
    difficulty: 'difícil'
  },
  {
    id: 'cra_comp_5',
    category: 'organizacao_politica_cra',
    categoryName: 'Organização Política e Administrativa / CRA',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A perda do mandato de Deputado à Assembleia Nacional (Artigo 152.º da CRA) ocorre expressamente nos casos de:',
    options: [
      'Condenação definitiva em pena de prisão superior a dois anos por crime doloso ou adesão a partido diverso daquele pelo qual foi eleito',
      'Falta injustificada a duas reuniões de comissão especializada',
      'Mudança de endereço residencial para outra província',
      'Emissão de opinião política crítica no parlamento'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 152.º (Perda e Renúncia do Mandato Parlamentar)',
    explanation: 'A perda de mandato parlamentar salvaguarda a fidelidade partidária eleitoral e a idoneidade criminal dos representantes do povo.',
    difficulty: 'difícil'
  },

  // --- NOÇÕES DE ADMINISTRAÇÃO PÚBLICA (adm_comp_1 a adm_comp_8) ---
  {
    id: 'adm_comp_1',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O que deve fazer o funcionário público ao atender uma pessoa com deficiência, idosa ou mulher grávida?',
    options: [
      'Conceder atendimento prioritário e preferencial nos termos da lei e das boas normas de civismo',
      'Obrigá-la a aguardar no fim da fila geral até ao encerramento do expediente',
      'Recusar o atendimento e encaminhá-la para outra província',
      'Cobrar uma taxa extraordinária de urgência não autorizada por lei'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 26/22 e Regulamentos de Atendimento ao Cidadão na Função Pública',
    explanation: 'A prioridade a pessoas vulneráveis e idosas é um dever cívico e legal de humanização do serviço público.',
    difficulty: 'fácil'
  },
  {
    id: 'adm_comp_2',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A declaração de bens e rendimentos exigida pela Lei da Probidade Pública (Lei n.º 3/10) a todos os titulares de cargos públicos tem como objectivo precípuo:',
    options: [
      'Prevenir a corrupção, monitorar o património e combater o enriquecimento sem causa justa durante o exercício do cargo',
      'Cobrar o dobro dos impostos residenciais aos dirigentes',
      'Publicar os salários em panfletos de feiras comerciais',
      'Sortear viaturas entre os funcionários de menor categoria'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 3/10 (Lei da Probidade Pública) - Declaração de Bens e Interesses',
    explanation: 'O controlo da evolução patrimonial dos gestores públicos é um dos mais eficazes instrumentos de transparência e integridade pública.',
    difficulty: 'médio'
  },
  {
    id: 'adm_comp_3',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O Princípio da Transparência e Publicidade dos actos administrativos (CRA - Artigo 200.º) garante ao cidadão:',
    options: [
      'O direito de ser informado pela Administração sobre o andamento dos processos em que tenha interesse directo e conhecer as decisões que lhe digam respeito',
      'O acesso irrestrito aos códigos secretos de segurança militar do Estado',
      'O direito de levar para casa os ficheiros originais da repartição',
      'A publicação de dados íntimos de saúde dos funcionários'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 200.º e Lei do Procedimento Administrativo',
    explanation: 'O cidadão tem o direito de certidão e acesso aos processos administrativos para fiscalizar a actuação dos serviços públicos.',
    difficulty: 'médio'
  },
  {
    id: 'adm_comp_4',
    category: 'nocoes_administracao_publica',
    categoryName: 'Noções de Administração Pública',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'No Direito Administrativo, a "Revogação do Acto Administrativo" distingue-se da "Anulação" porque:',
    options: [
      'A revogação incide sobre um acto válido por razões de oportunidade, mérito e conveniência para o interesse público, enquanto a anulação baseia-se na ilegalidade ou vício jurídico do acto',
      'A revogação só pode ser aplicada a cidadãos estrangeiros e a anulação a nacionais',
      'Não há distinção entre revogação e anulação no direito comparado',
      'A revogação é decidida apenas por tribunais internacionais'
    ],
    correctIndex: 0,
    lawReference: 'Direito Administrativo Geral - Teoria da Extinção dos Actos Administrativos',
    explanation: 'A anulação sanciona o acto ilegal desde a génese; a revogação extingue o acto legal que deixou de ser conveniente ou oportuno para a Administração.',
    difficulty: 'difícil'
  },

  // --- LEGISLAÇÃO MININT (min_comp_1 a min_comp_8) ---
  {
    id: 'min_comp_1',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'PNA',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O agente da Polícia Nacional de Angola deve exibir a sua carteira de identificação policial ou crachá profissional:',
    options: [
      'Sempre que for solicitado no exercício das suas funções ou ao dirigir-se a um cidadão em intervenções à civil ou uniformizado',
      'Apenas aos seus amigos de infância',
      'Nunca, pois a sua palavra basta sem qualquer identificação',
      'Apenas mediante autorização judicial prévia por escrito'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 6/20 (Lei da PNA) - Identificação e Deontologia',
    explanation: 'A identificação funcional transparente é garantia de segurança jurídica e previne a actuação de falsos agentes policiais.',
    difficulty: 'fácil'
  },
  {
    id: 'min_comp_2',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SIC',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Qual é o ramo especializado do SIC encarregue de investigar fraudes cometidas em sistemas informáticos, internet e redes digitais?',
    options: [
      'Departamento de Combate aos Crimes Cibernéticos (Cibercrime)',
      'Secção de Arquivo Geral de Papel',
      'Gabinete de Rádio Comunitária',
      'Divisão de Parque Automóvel'
    ],
    correctIndex: 0,
    lawReference: 'Lei das Telecomunicações e Estatuto Orgânico do SIC - Combate ao Cibercrime',
    explanation: 'O departamento de cibercrime do SIC investiga invasões a contas bancárias online, chantagens virtuais e clonagem de dados.',
    difficulty: 'médio'
  },
  {
    id: 'min_comp_3',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SME',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O Visto de Fronteira emitido pelo SME é concedido excepcionalmente nos postos de fronteira a cidadãos estrangeiros que:',
    options: [
      'Por razões ponderosas de emergência justificada, não tenham podido solicitar visto prévio na missão diplomática ou consular angolana',
      'Venham fixar residência definitiva sem qualquer documento de suporte',
      'Comprem um bilhete de autocarro sem passaporte válido',
      'Tenham sido expulsos de outro país por crimes graves'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 13/19 - Visto de Fronteira',
    explanation: 'O visto de fronteira é uma medida excepcional e extraordinária concedida apenas por motivos inadiáveis comprovados.',
    difficulty: 'fácil'
  },
  {
    id: 'min_comp_4',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SPCB',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'Nas operações de combate a incêndios de grandes proporções em áreas residenciais densas, a prioridade máxima do SPCB é:',
    options: [
      'O salvamento e evacuação imediata de vidas humanas em perigo',
      'A recuperação de electrodomésticos e mobílias caras',
      'A fotografia dos edifícios em chamas para redes sociais',
      'A cobrança de taxas aos proprietários dos edifícios'
    ],
    correctIndex: 0,
    lawReference: 'Doutrina Operacional do SPCB - Princípio da Prioridade da Vida Humana',
    explanation: 'A salvaguarda da vida humana sobrepõe-se a qualquer bem material ou patrimonial nas operações de emergência e socorro.',
    difficulty: 'médio'
  },
  {
    id: 'min_comp_5',
    category: 'legislacao_minint',
    categoryName: 'Legislação do MININT',
    branch: 'SP',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'A reinserção social de reclusos jovens (jovens adultos) no sistema penitenciário angolano prioriza:',
    options: [
      'A escolarização acelerada, alfabetização e formação técnico-profissional intensiva para afastar o jovem do crime',
      'A transferência perpétua para presídios de segurança máxima',
      'A cobrança de salários às famílias dos detidos',
      'O isolamento sem contacto com professores ou assistentes sociais'
    ],
    correctIndex: 0,
    lawReference: 'Lei n.º 8/08 (Lei Penitenciária) - Estabelecimentos para Jovens Reclusos',
    explanation: 'A capacitação educacional dos jovens reclusos é o factor mais determinante para quebrar o ciclo da reincidência criminal.',
    difficulty: 'médio'
  },

  // --- PATRIOTISMO E VALORES CÍVICOS (pvc_comp_1 a pvc_comp_5) ---
  {
    id: 'pvc_comp_1',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: '9th_grade',
    academicLevelLabel: '9.ª Classe',
    question: 'O respeito pelo património público (escolas, hospitais, pontes, jardins e viaturas de socorro) constitui:',
    options: [
      'Um dever cívico indeclinável de todos os cidadãos para a preservação dos bens construídos com os recursos de toda a Nação',
      'Uma preocupação exclusiva dos seguranças privados',
      'Um acto opcional que não tem qualquer impacto na comunidade',
      'Uma obrigação apenas para quem não trabalha'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigo 90.º (Deveres Fundamentais)',
    explanation: 'Destruir ou vandalizar bens públicos lesa toda a sociedade e atrasa o desenvolvimento sustentável do país.',
    difficulty: 'fácil'
  },
  {
    id: 'pvc_comp_2',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'high_school',
    academicLevelLabel: 'Ensino Médio',
    question: 'O lema tradicional que une as províncias angolanas "De Cabinda ao Cunene, Um Só Povo, Uma Só Nação" expressa:',
    options: [
      'A unidade, indivisibilidade e fraternidade de todos os angolanos independentemente da sua origem geográfica ou linguística',
      'A separação política das províncias costeiras',
      'A concessão de fronteiras internas com controlo de passaporte entre províncias',
      'A extinção das línguas regionais tradicionais'
    ],
    correctIndex: 0,
    lawReference: 'História e Doutrina Patriótica Angolana - Unidade Nacional',
    explanation: 'A unidade nacional constitui valor inegociável da soberania e convivência harmónica da República de Angola.',
    difficulty: 'médio'
  },
  {
    id: 'pvc_comp_3',
    category: 'patriotismo_valores_civicos',
    categoryName: 'Patriotismo e Valores Cívicos',
    branch: 'GERAL',
    academicLevel: 'higher_education',
    academicLevelLabel: 'Ensino Superior',
    question: 'A Solidariedade Intergeracional como princípio de justiça cívica e social (CRA - Artigo 80.º a 83.º) preconiza:',
    options: [
      'O compromisso recíproco de assistência e protecção entre gerações: os jovens protegem os idosos e a sociedade preserva os recursos para os vindouros',
      'O abandono dos aposentados à sua própria sorte',
      'A proibição do acesso dos jovens a cargos na função pública',
      'A concentração da riqueza pública numa única faixa etária'
    ],
    correctIndex: 0,
    lawReference: 'CRA - Artigos 80.º a 83.º (Juventude, Terceira Idade e Família)',
    explanation: 'A coesão intergeracional assegura a dignidade da velhice e o fomento das capacidades da juventude num ciclo virtuoso de justiça social.',
    difficulty: 'difícil'
  }
];

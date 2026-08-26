import { Question } from '../types';
import { HISTORIA_ANGOLA_QUESTIONS } from './questions/historiaAngola';
import { ORGANIZACAO_POLITICA_CRA_QUESTIONS } from './questions/organizacaoPoliticaCra';
import { NOCOES_ADMINISTRACAO_PUBLICA_QUESTIONS } from './questions/nocoesAdministracaoPublica';
import { LEGISLACAO_MININT_QUESTIONS } from './questions/legislacaoMinint';
import { PATRIOTISMO_VALORES_CIVICOS_QUESTIONS } from './questions/patriotismoValoresCivicos';
import { EXPANDED_EXTRA_QUESTIONS } from './questions/expandedExtra';
import { OFFICIAL_SIMULATION_BANK } from './questions/officialSimulationBank';
import { MININT_DEEP_BRANCH_QUESTIONS } from './questions/minintDeepBranches';
import { COMPREHENSIVE_EXPANSION_QUESTIONS } from './questions/comprehensiveExpansion';
import { ADDITIONAL_PRACTICE_QUESTIONS } from './questions/additionalPracticeQuestions';
import { FINAL_MASTERY_QUESTIONS } from './questions/finalMasteryQuestions';

// Banco Central de Questões Oficial do Concurso MININT (Expandido e Categorizado)
export const QUESTION_BANK: Question[] = [
  ...HISTORIA_ANGOLA_QUESTIONS,
  ...ORGANIZACAO_POLITICA_CRA_QUESTIONS,
  ...NOCOES_ADMINISTRACAO_PUBLICA_QUESTIONS,
  ...LEGISLACAO_MININT_QUESTIONS,
  ...PATRIOTISMO_VALORES_CIVICOS_QUESTIONS,
  ...EXPANDED_EXTRA_QUESTIONS,
  ...OFFICIAL_SIMULATION_BANK,
  ...MININT_DEEP_BRANCH_QUESTIONS,
  ...COMPREHENSIVE_EXPANSION_QUESTIONS,
  ...ADDITIONAL_PRACTICE_QUESTIONS,
  ...FINAL_MASTERY_QUESTIONS
];

// Helper functions e exportações
export const getQuestionsByCategory = (category: string): Question[] => {
  return QUESTION_BANK.filter(q => q.category === category);
};

export const getQuestionsByBranch = (branch: string): Question[] => {
  return QUESTION_BANK.filter(q => q.branch === branch || q.branch === 'GERAL');
};

export const getQuestionsByLevel = (level: string): Question[] => {
  return QUESTION_BANK.filter(q => q.academicLevel === level || q.academicLevel === 'todos');
};

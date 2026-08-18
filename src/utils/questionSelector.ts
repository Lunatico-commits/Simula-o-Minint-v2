import { Question, QuestionCategory, AcademicLevel, normalizeCategory } from '../types';
import { QUESTION_BANK } from '../data/questions';

/**
 * Fisher-Yates (Knuth) Shuffle algorithm.
 * Produces an unbiased, uniform random permutation of an array.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles the answer options (A, B, C, D) of a question using Fisher-Yates,
 * accurately updating correctIndex so the correct answer validation remains 100% precise.
 */
export function shuffleQuestionOptions(question: Question): Question {
  if (!question || !Array.isArray(question.options) || question.options.length <= 1) {
    return question;
  }

  // Create indexed option objects to preserve original correct answer identity
  const indexedOptions = question.options.map((optText, originalIndex) => ({
    text: optText,
    isCorrect: originalIndex === question.correctIndex,
  }));

  // Perform Fisher-Yates shuffle on the options array
  const shuffledIndexed = fisherYatesShuffle(indexedOptions);

  const shuffledOptions = shuffledIndexed.map((item) => item.text);
  const newCorrectIndex = shuffledIndexed.findIndex((item) => item.isCorrect);

  return {
    ...question,
    options: shuffledOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

/**
 * Retrieves the combined question pool including any custom questions saved by Admin
 */
function getMergedQuestionBank(): Question[] {
  try {
    const customSaved = localStorage.getItem('minint_custom_questions');
    if (customSaved) {
      const parsed = JSON.parse(customSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return [...parsed, ...QUESTION_BANK];
      }
    }
  } catch (_) {}
  return QUESTION_BANK;
}

export interface GetRandomQuestionsOptions {
  category?: QuestionCategory | 'todas' | 'misto';
  academicLevel?: AcademicLevel;
  difficulty?: 'fácil' | 'médio' | 'difícil' | 'todas';
  count: number;
  modeKey?: 'rapido' | 'exame' | 'materia' | 'desafio' | 'duel' | string;
}

// In-memory cache for recent question IDs per mode to prevent repetitions
const recentQuestionIdsByMode: Record<string, string[]> = {};

function getRecentIds(modeKey: string): string[] {
  if (recentQuestionIdsByMode[modeKey]) {
    return recentQuestionIdsByMode[modeKey];
  }
  try {
    const stored = localStorage.getItem(`minint_recent_q_${modeKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        recentQuestionIdsByMode[modeKey] = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  recentQuestionIdsByMode[modeKey] = [];
  return [];
}

function saveRecentIds(modeKey: string, ids: string[]): void {
  recentQuestionIdsByMode[modeKey] = ids;
  try {
    localStorage.setItem(`minint_recent_q_${modeKey}`, JSON.stringify(ids));
  } catch (_) {}
}

/**
 * Dynamically selects and shuffles questions using Fisher-Yates algorithm,
 * prioritizing unseen/unrepeated questions to avoid repetition across attempts.
 * Also shuffles the options (A, B, C, D) within each selected question.
 */
export function getRandomQuestions(options: GetRandomQuestionsOptions): Question[] {
  const { category, academicLevel, difficulty, count, modeKey = 'general' } = options;

  const fullBank = getMergedQuestionBank();

  // 1. Filter bank by category (if specified) and academic level (if specified)
  let candidatePool = [...fullBank];

  if (category && category !== 'todas' && category !== 'misto') {
    const exactMatches = candidatePool.filter(q => q.category === category);
    if (exactMatches.length >= count) {
      candidatePool = exactMatches;
    } else {
      const normCategory = normalizeCategory(category);
      const normMatches = candidatePool.filter(q => normalizeCategory(q.category) === normCategory);
      if (normMatches.length > 0) {
        candidatePool = normMatches;
      }
    }
  }

  if (academicLevel) {
    const levelPool = candidatePool.filter(q => q.academicLevel === academicLevel);
    if (levelPool.length >= count) {
      candidatePool = levelPool;
    }
  }

  if (difficulty && difficulty !== 'todas') {
    const diffMatches = candidatePool.filter(q => q.difficulty === difficulty);
    if (diffMatches.length >= count) {
      candidatePool = diffMatches;
    } else if (diffMatches.length > 0) {
      const otherMatches = candidatePool.filter(q => q.difficulty !== difficulty);
      candidatePool = [...diffMatches, ...otherMatches];
    }
  }

  // Fallback if candidate pool is empty or too small
  if (candidatePool.length === 0) {
    candidatePool = [...fullBank];
  }

  // 2. Track recently used questions for this mode
  const recentIds = getRecentIds(modeKey);

  // Separate pool into unseen and seen
  const unseenPool = candidatePool.filter(q => !recentIds.includes(q.id));
  const seenPool = candidatePool.filter(q => recentIds.includes(q.id));

  let selected: Question[] = [];

  if (unseenPool.length >= count) {
    // We have enough unseen questions: shuffle unseen with Fisher-Yates and take `count`
    const shuffledUnseen = fisherYatesShuffle(unseenPool);
    selected = shuffledUnseen.slice(0, count);

    // Update recent IDs (keep up to 60 recent IDs per mode)
    const newRecentIds = [...recentIds, ...selected.map(q => q.id)].slice(-60);
    saveRecentIds(modeKey, newRecentIds);
  } else {
    // Not enough unseen questions left: shuffle both unseen and seen independently with Fisher-Yates
    const shuffledUnseen = fisherYatesShuffle(unseenPool);
    const shuffledSeen = fisherYatesShuffle(seenPool);

    selected = [...shuffledUnseen, ...shuffledSeen].slice(0, count);

    // Reset recent IDs for this mode to the newly selected IDs
    saveRecentIds(modeKey, selected.map(q => q.id));
  }

  // Shuffle options A, B, C, D for every selected question
  return selected.map(q => shuffleQuestionOptions(q));
}

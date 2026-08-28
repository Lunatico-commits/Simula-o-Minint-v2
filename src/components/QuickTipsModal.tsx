import React from 'react';
import { DailyStudyTip } from './DailyStudyTip';
import { OfficialSubjectKey } from '../data/quickTipsData';

export { DAILY_STUDY_TIPS, OFFICIAL_CATEGORIES } from '../data/quickTipsData';
export type { StudyTip, OfficialSubjectKey } from '../data/quickTipsData';

interface QuickTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string, categoryKey?: string) => void;
  initialCategory?: OfficialSubjectKey | 'all';
}

export const QuickTipsModal: React.FC<QuickTipsModalProps> = (props) => {
  return <DailyStudyTip {...props} />;
};

export default QuickTipsModal;

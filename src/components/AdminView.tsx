import React from 'react';
import { AdminPanelModal } from './AdminPanelModal';
import { UserProfile } from '../types';

export interface AdminViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentProfile: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
}

/**
 * AdminView is an alias / standalone wrapper around AdminPanelModal
 * providing comprehensive access to advertisements, statistics,
 * user/candidate listings, and question bank administration.
 */
export const AdminView: React.FC<AdminViewProps> = ({
  isOpen = true,
  onClose = () => {},
  currentProfile,
  onUpdateProfile,
}) => {
  return (
    <AdminPanelModal
      isOpen={isOpen}
      onClose={onClose}
      currentProfile={currentProfile}
      onUpdateProfile={onUpdateProfile}
    />
  );
};

export default AdminView;

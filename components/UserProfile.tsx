import React from 'react';
import type { RedditUserMeData } from '../types';
import { KarmaIcon, LogoutIcon, UserIcon } from './IconComponents';
import { formatNumber } from '../utils/formatters';

interface UserProfileProps {
  user: RedditUserMeData;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const profileImg = user.snoovatar_img || user.icon_img?.split('?')[0];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-right">
        <div>
            <p className="font-bold text-sm text-white">{user.name}</p>
            <div className="flex items-center justify-end gap-1 text-xs text-orange-400">
                <KarmaIcon className="w-3.5 h-3.5" />
                <span>{formatNumber(user.total_karma)}</span>
            </div>
        </div>
        {profileImg ? (
            <img src={profileImg} alt="User avatar" className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
        ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-400" />
            </div>
        )}
      </div>
      <button
        onClick={onLogout}
        title="Logout"
        className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Logout"
      >
        <LogoutIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { Trophy } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow enter animation
    const timerIn = setTimeout(() => setVisible(true), 100);
    // Auto hide after 2.5 seconds (Optimized for faster pacing)
    const timerOut = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); // Wait for exit animation
    }, 1500);

    return () => {
      clearTimeout(timerIn);
      clearTimeout(timerOut);
    };
  }, [onClose]);

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="flex items-center gap-4 bg-zinc-900 border border-yellow-500/50 rounded-lg p-4 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <div className="bg-yellow-500/10 p-2 rounded-full border border-yellow-500/30">
                <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
                <div className="text-[10px] font-mono text-yellow-600 uppercase tracking-widest font-bold mb-0.5">Achievement Unlocked</div>
                <div className="text-sm font-bold text-yellow-100">{achievement.title}</div>
                <div className="text-xs text-zinc-400 mt-0.5 max-w-[200px] truncate">{achievement.description}</div>
            </div>
        </div>
    </div>
  );
};

export default AchievementToast;
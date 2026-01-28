/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React from 'react';
import { Achievement } from '../types';
import { ACHIEVEMENTS } from '../constants';
import * as Icons from 'lucide-react';

interface AchievementListProps {
  unlockedIds: string[];
  onClose: () => void;
}

const AchievementList: React.FC<AchievementListProps> = ({ unlockedIds, onClose }) => {
  
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icons.Trophy size={20} className="text-yellow-500" />
                        成就图鉴 (TROPHY ROOM)
                    </h2>
                    <div className="text-xs text-zinc-500 font-mono mt-1">
                        已解锁: {unlockedCount} / {totalCount} ({progress.toFixed(0)}%)
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                    <Icons.X size={24} className="text-zinc-400" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/50">
                {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = unlockedIds.includes(ach.id);
                    // Use type assertion for dynamic icon lookup
                    const IconComponent = (Icons as any)[ach.icon] || Icons.HelpCircle;

                    return (
                        <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isUnlocked ? 'bg-zinc-900 border-yellow-900/30' : 'bg-zinc-900/30 border-zinc-800'}`}>
                            <div className={`p-3 rounded-full shrink-0 ${isUnlocked ? 'bg-yellow-500/10 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-zinc-800 text-zinc-600 grayscale'}`}>
                                <IconComponent size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className={`font-bold ${isUnlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                                        {isUnlocked || !ach.isHidden ? ach.title : '???'}
                                    </h3>
                                    {isUnlocked && <Icons.Check size={16} className="text-emerald-500" />}
                                </div>
                                <p className={`text-sm ${isUnlocked ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    {isUnlocked || !ach.isHidden ? ach.description : '解锁此成就以查看详情。'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default AchievementList;
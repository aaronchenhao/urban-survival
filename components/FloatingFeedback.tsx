/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useEffect, useState } from 'react';
import { ChoiceEffect } from '../types';
import { ChevronsUp, ChevronsDown } from 'lucide-react';

interface FloatingFeedbackProps {
  effects: ChoiceEffect[];
}

const FloatingFeedback: React.FC<FloatingFeedbackProps> = ({ effects }) => {
  const [visibleItems, setVisibleItems] = useState<{ id: number; effect: ChoiceEffect }[]>([]);

  useEffect(() => {
    if (effects.length > 0) {
      const timestamp = Date.now();
      const newItems = effects.map((effect, index) => ({
        id: timestamp + index,
        effect
      }));
      setVisibleItems(newItems);

      const timer = setTimeout(() => {
        setVisibleItems([]);
      }, 2000); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [effects]);

  if (visibleItems.length === 0) return null;

  const labelMap: Record<string, string> = {
    cash: '现金',
    body: '身体',
    mind: '心理',
    moral: '道德',
    safeInvest: '稳健资产',
    riskyInvest: '激进持仓',
    performance: '工作绩效'
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center gap-2">
      {visibleItems.map((item, index) => {
        const { stat, value } = item.effect;
        if (value === 0) return null;
        const isPositive = value > 0;
        
        return (
          <div
            key={item.id}
            className={`
              flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border shadow-2xl backdrop-blur-md font-bold text-sm md:text-lg animate-float-up
              ${isPositive 
                ? 'bg-emerald-900/80 border-emerald-500 text-emerald-300' 
                : 'bg-rose-900/80 border-rose-500 text-rose-300'
              }
            `}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {isPositive ? <ChevronsUp size={16} className="md:w-5 md:h-5" /> : <ChevronsDown size={16} className="md:w-5 md:h-5" />}
            <span>{labelMap[stat] || stat}</span>
            <span className="font-mono">{isPositive ? '+' : ''}{value}</span>
          </div>
        );
      })}
      <style>{`
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          10% { opacity: 1; transform: translateY(0) scale(1.1); }
          80% { opacity: 1; transform: translateY(-40px) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.9); }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FloatingFeedback;
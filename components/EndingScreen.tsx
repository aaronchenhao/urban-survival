/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import React, { useEffect, useState, useRef } from 'react';
import { Stats } from '../types';
import StatBar from './StatBar';
import { RotateCcw, Power, Terminal, Building2, Briefcase, Skull, Home, Trophy, HeartCrack, BrainCircuit, Wallet, Gavel, Radar, Clock, Ghost, Plane, Frown, Globe2, Siren } from 'lucide-react';

interface EndingScreenProps {
  stats: Stats;
  history: string[];
  playCount: number;
  flags: string[]; // NEW PROP needed for radar
  onRestart: () => void;
}

type EndingTier = 'ASCEND' | 'ESCAPE' | 'FOLD' | 'VANISHED' | 'CRIMINAL';

const EndingScreen: React.FC<EndingScreenProps> = ({ stats, history, playCount, flags = [], onRestart }) => {
  const [view, setView] = useState<'RESULT' | 'EPILOGUE'>('RESULT');
  const [epilogueTimer, setEpilogueTimer] = useState(12);
  const [canReboot, setCanReboot] = useState(false);
  
  // 1. Calculate Core Financials
  // Logic Fix: If WENT_ABROAD, current cash is essentially netWorth (already liquidated in node 10)
  const isAbroad = flags.includes('WENT_ABROAD');
  const isCriminal = flags.includes('CRIMINAL');
  const investedTotal = stats.safeInvest + stats.riskyInvest;
  const netWorth = stats.cash + investedTotal;
  
  // 2. Identify Critical Choices
  const hasHouse = flags.includes('OWN_HOUSE'); 
  const leftCity = history.includes('n9-c3') || history.includes('n5-c3') || flags.includes('MARRIED_HOME'); 
  
  // 3. FAILURE CHECK (The "Hardcore" Rule)
  const FAIL_THRESHOLD = 20;
  const failConditions = [
      { id: 'wealth', met: netWorth < 20000, label: '赤贫' }, 
      { id: 'body', met: stats.body < FAIL_THRESHOLD, label: '病危' },
      { id: 'mind', met: stats.mind < FAIL_THRESHOLD, label: '崩溃' },
      { id: 'moral', met: stats.moral < FAIL_THRESHOLD, label: '失格' }
  ];
  const failCount = failConditions.filter(c => c.met).length;

  let tier: EndingTier = 'FOLD';

  // PRIORITY 0: CRIMINAL ENDING (Special)
  if (isCriminal) {
      tier = 'CRIMINAL';
  }
  // PRIORITY 1: DEBT TRAP DEATH (Highest Priority)
  else if (flags.includes('DEBT_TRAP') && stats.cash < 0) {
      tier = 'VANISHED';
  }
  // PRIORITY 2: Check Failure
  else if (failCount >= 2) {
      tier = 'FOLD';
  } 
  // PRIORITY 3: Check Ascension (Win Condition - 5% Chance)
  // Thresholds raised significantly. Net worth must be > 800k.
  else if (
      (netWorth > 800000) || // Wealth Victory
      (leftCity && netWorth > 500000) || // Smart Exit
      (hasHouse && stats.cash > 100000 && stats.mind > 80) // Perfect Stability
  ) {
      tier = 'ASCEND';
  } 
  // PRIORITY 4: Survival (Default if not Folded and not Ascended - 20% Chance)
  else {
      tier = 'ESCAPE';
  }

  // --- Save Legacy for NG+ ---
  // MODIFIED: Always update the previous tier. 
  // If player Ascended, they get bonus next run. 
  // If they failed/escaped this run, the bonus is lost for the *next* run.
  useEffect(() => {
      localStorage.setItem('csl_prev_tier', tier);
  }, [tier]);

  // --- Epilogue Timer Logic ---
  useEffect(() => {
    let interval: number;
    if (view === 'EPILOGUE') {
        interval = window.setInterval(() => {
            setEpilogueTimer((prev) => {
                if (prev <= 1) {
                    setCanReboot(true);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // 4. Generate Asset Tag
  let assetTag = '';
  
  if (isCriminal) {
      assetTag = '黑金 (Illegal)';
  } else if (stats.cash < 0) {
      assetTag = '负债累累';
  } else if (hasHouse) {
      assetTag = '房奴 (固定资产)';
  } else if (investedTotal > stats.cash * 2) {
      if (stats.riskyInvest > stats.safeInvest) assetTag = '激进赌徒';
      else assetTag = '理财达人';
  } else if (stats.cash > investedTotal * 3) {
      assetTag = '现金为王';
  } else {
      assetTag = '平衡配置';
  }

  // 5. Personality Radar Logic
  const calcPersonality = () => {
    let pragmatist = 20; // 实用
    let traditional = 20; // 传统
    let gambler = 20; // 赌徒
    let layflat = 20; // 躺平

    if (flags.includes('GRAY_AREA')) pragmatist += 30;
    if (flags.includes('MARRIED_DEAL')) pragmatist += 40; 
    if (flags.includes('SKILL_UP')) pragmatist += 20;
    if (stats.cash > 100000) pragmatist += 10;

    if (flags.includes('OWN_HOUSE')) traditional += 40;
    if (flags.includes('CIVIL_PREP')) traditional += 30;
    if (flags.includes('MARRIED_HOME')) traditional += 20;
    if (flags.includes('LOVE_STABLE')) traditional += 20;

    if (flags.includes('ENTREPRENEUR')) gambler += 40;
    if (flags.includes('DEBT_TRAP')) gambler += 30;
    if (flags.includes('MARRIED_MOON')) gambler += 30; 
    if (isAbroad) gambler += 20; // Running away is a gamble
    if (isCriminal) gambler += 50;
    if (stats.riskyInvest > 50000) gambler += 30;

    if (flags.includes('LAY_FLAT')) layflat += 40;
    if (flags.includes('UNEMPLOYED')) layflat += 30;
    if (flags.includes('GIVE_UP')) layflat += 30;
    if (stats.body > 80) layflat += 20;

    return { pragmatist, traditional, gambler, layflat };
  };

  const pScores = calcPersonality();
  const maxScore = Math.max(pScores.pragmatist, pScores.traditional, pScores.gambler, pScores.layflat, 100);

  // 6. Generate Narrative
  let title = '';
  let description = '';
  let Icon = Terminal;
  let colorClass = '';

  // --- SPECIAL CASE: ABROAD BRANCH (Override standard tier if not Vanished) ---
  if (isAbroad && tier !== 'VANISHED') {
      // KILL RATE CHECK: Did they have enough *real* money after liquidation?
      // Assume liquidating cost them 10-20% friction, plus moving costs.
      // Effective cash = stats.cash.
      // If effective cash < 150k (meaning they barely scraped by Node 10 check), they struggle.
      
      const isWeak = stats.body < 50 || stats.mind < 50;
      const isPoorAbroad = stats.cash < 250000; // 250k threshold for comfort abroad

      if (isWeak) {
          // CUSTOM SCENARIO: Weak Body/Mind Abroad
          colorClass = 'text-indigo-400 border-indigo-900/50 shadow-[0_0_50px_rgba(129,140,248,0.2)] bg-indigo-950/10';
          Icon = Frown;
          title = '流亡异乡 (Exile)';
          description = '你以为换个地方就能换种活法，但身体的病痛和灵魂的空虚不需要护照。在异国他乡的深夜，你听不懂窗外的语言，也没人听得懂你的孤独。你自由了，像是一个被切断了线的风筝，在寒风中坠落。你的积蓄只能维持基本的生存，不敢看病，不敢社交。';
      } else if (isPoorAbroad) {
          // CUSTOM SCENARIO: Poor Abroad
          colorClass = 'text-gray-400 border-gray-800 shadow-[0_0_50px_rgba(100,100,100,0.2)] bg-zinc-900';
          Icon = Plane;
          title = '国际黑户';
          description = '汇率差和高昂的生活成本瞬间击穿了你的预算。为了留下来，你不得不去打黑工，洗盘子、搬砖，干着比国内更累的活。你失去了合法的身份，每天活在被遣返的恐惧中。这真的是你想要的自由吗？';
      } else {
          // SUCCESS SCENARIO: Global Citizen
          colorClass = 'text-sky-400 border-sky-900/50 shadow-[0_0_50px_rgba(14,165,233,0.2)] bg-sky-950/10';
          Icon = Globe2;
          title = '世界公民';
          description = '你不仅带走了财富，还带走了生存的智慧。在新的国度，你建立了新的坐标。没有了内卷和年龄焦虑，你终于找回了呼吸的节奏。过去的苦难成了你酒后的谈资，你终于不再是谁的燃料，你属于你自己。';
      }
  }
  // --- TIER: CRIMINAL ---
  else if (tier === 'CRIMINAL') {
      colorClass = 'text-purple-500 border-purple-900 shadow-[0_0_50px_rgba(147,51,234,0.3)] bg-purple-950/20';
      Icon = Siren;
      title = '绝命毒师';
      description = '你通过地下渠道获得了巨额财富，但也出卖了灵魂。你再也无法睡一个安稳觉，每一个敲门声都让你心惊肉跳。你买了豪宅，却不敢写自己的名字。你活着，但你作为“良民”的身份已经彻底死亡。你永远生活在阴影里。';
  }
  // --- TIER 0: VANISHED (人间蒸发) ---
  else if (tier === 'VANISHED') {
      colorClass = 'text-gray-500 border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black';
      Icon = Ghost;
      title = '人间蒸发';
      description = '这不是普通的破产。那天深夜你被带上了一辆面包车，从此档案里查无此人。有人说在公海的渔船上见过你，也有人说你成了地下黑市的“零件库”。你没能跑赢利息，利息吞噬了你的血肉。你彻底输掉了这场游戏。';
  }
  // --- TIER 3: FOLD (被折叠/淘汰) ---
  else if (tier === 'FOLD') {
      colorClass = 'text-rose-500 border-rose-900/50 shadow-[0_0_50px_rgba(225,29,72,0.2)] bg-rose-950/10';
      Icon = Skull;
      
      const fails = failConditions.filter(c => c.met).map(c => c.id);
      
      if (fails.includes('body') && fails.includes('moral')) {
          Icon = HeartCrack;
          title = '孤岛病患';
          description = '你为了在这个城市活下去，出卖了尊严和底线，透支了所有的健康。当你倒在病床上时，通讯录里几百个人，却找不到一个愿意为你签字手术的人。你赢了生存游戏的前半场，却输掉了做人的资格。';
      } else if (fails.includes('body') && fails.includes('mind')) {
          Icon = BrainCircuit;
          title = '废弃零件';
          description = '高压的工作环境像榨汁机一样榨干了你的精力和情绪。严重的抑郁症伴随着慢性劳损，让你彻底失去了劳动能力。你被系统判定为“低价值损耗品”，在城市的角落里无声地锈蚀。';
      } else if (fails.includes('moral') && fails.includes('wealth')) {
          Icon = Gavel;
          title = '失信亡命';
          description = '贫穷让你铤而走险，你借网贷、搞灰产、欺骗朋友。最终泡沫破裂，你不仅一无所有，还背上了巨额债务和法律污点。你躲在城中村的出租屋里，连窗帘都不敢拉开。';
      } else if (fails.includes('mind') && fails.includes('wealth')) {
          Icon = Wallet;
          title = '流浪灵魂';
          description = '长期的贫困和焦虑击穿了你的心理防线。你不再思考未来，只关心下一顿饭。你成为了地铁站里那个眼神空洞的流浪者，看着衣着光鲜的人群，仿佛看着另一个物种。';
      } else if (fails.includes('body') && fails.includes('wealth')) {
          Icon = Skull;
          title = '燃料耗尽';
          description = '“拿命换钱”的赌局你输了。钱没攒下，身体先垮了。高昂的医药费瞬间击穿了你脆弱的现金流。你最后看了一眼这座繁华的城市，它依然光鲜亮丽，就像你从未存在过一样。';
      } else {
          title = '全面坍塌';
          description = '健康、财富、精神、道德——你的人生四柱同时断裂。这不是意外，这是系统性的崩溃。你是这座残酷斗兽场里被清理的残骸。';
      }
  } 
  // --- TIER 2: ESCAPE (幸存者) ---
  else if (tier === 'ESCAPE') {
      colorClass = 'text-cyan-400 border-cyan-900/50 shadow-[0_0_50px_rgba(8,145,178,0.2)] bg-cyan-950/10';
      Icon = Briefcase;

      if (leftCity) {
          Icon = Home;
          title = '有序撤退';
          description = '你意识到这个战场不属于你。带着一身伤痕和仅存的积蓄，你选择了离开。这不算胜利，但至少是一次体面的止损。家乡的风，也许比CBD的空调更养人。';
      } else if (hasHouse) {
          Icon = Building2;
          title = '混凝土囚徒';
          description = '你留下来了，还有了自己的房子。但看着镜子里疲惫的脸，和每月雷打不动的房贷账单，你偶尔会怀疑：是你拥有了房子，还是房子吞噬了你？';
      } else {
          title = '低空飞行';
          description = '你学会了在这个城市的夹缝中生存。不追求大富大贵，只求无灾无难。你像一只变色龙，小心翼翼地活着，虽然平庸，但至少还在呼吸。';
      }
  }
  // --- TIER 1: ASCEND (天选之人) ---
  else {
      colorClass = 'text-emerald-400 border-emerald-900/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] bg-emerald-950/10';
      Icon = Trophy;

      if (stats.moral < 40) {
          title = '赛博财阀';
          description = '你通过冷血的决策和对规则的利用，站在了食物链的顶端。你拥有了巨额财富，但也失去了一些名为“人性”的东西。你看着脚下的城市，眼里只有数据和资源。';
      } else if (flags.includes('ENTREPRENEUR')) {
          title = '新晋巨鳄';
          description = '站在上市敲钟/并购签约的现场，闪光灯让你眩晕。你看着台下那些渴望的眼神，像极了当年的自己。你屠龙成功，也长出了鳞片。你是这个时代的幸存者偏差。';
      } else {
          title = '阶级跃升';
          description = '你不仅活下来了，还成为了捕食者。你拥有了足够的资本和资源，这座曾经压迫你的城市，现在成了你的游乐场。';
      }
  }

  const handleAction = () => {
    // Only verify restart count logic here
    if (playCount >= 3) {
      setView('EPILOGUE');
    } else {
      onRestart();
    }
  };

  const RadarBar = ({ label, score, color }: any) => (
      <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between text-[10px] uppercase text-zinc-500 font-mono">
              <span>{label}</span>
              <span>{Math.min(100, score)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                  className={`h-full ${color} transition-all duration-1000`} 
                  style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }} 
              />
          </div>
      </div>
  );

  if (view === 'RESULT') {
    // FIXED LAYOUT: Use fixed container with overflow-y-auto to allow scrolling on mobile
    // Use pb-safe and extra padding to ensure bottom button isn't obscured
    return (
      <div className="fixed inset-0 h-dvh w-full bg-black overflow-y-auto custom-scrollbar animate-fade-in z-50">
        <div className="min-h-full w-full flex flex-col items-center justify-center p-4 py-12 text-center pb-safe">
            <div className={`max-w-md w-full border-2 p-6 rounded-xl backdrop-blur-md relative overflow-hidden ${colorClass} mb-4`}>
              
              <div className="absolute top-4 right-4 text-xs font-black uppercase tracking-widest opacity-50 border border-current px-2 py-1 rounded">
                等级: {tier === 'FOLD' ? 'FOLD' : (isAbroad && tier !== 'VANISHED' ? 'ABROAD' : tier)}
              </div>

              <div className="flex justify-center mb-6 opacity-90 mt-4">
                <Icon size={64} strokeWidth={1.2} />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">{title}</h1>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-2 py-1 bg-current/10 rounded text-xs font-bold tracking-wider">{assetTag}</span>
                  {failConditions.filter(c => c.met).map(c => (
                      <span key={c.id} className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold tracking-wider border border-red-800">
                          {c.label}警告
                      </span>
                  ))}
              </div>

              <p className="text-zinc-300 mb-8 leading-relaxed font-light text-sm text-left border-l-2 border-zinc-700 pl-4">
                {description}
              </p>

              <div className="grid gap-4 mb-8 text-left bg-black/40 p-4 md:p-5 rounded-lg border border-white/10">
                <StatBar label="最终净资产" statKey="cash" value={netWorth} />
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className={`text-center bg-white/5 rounded p-2 ${stats.body < FAIL_THRESHOLD ? 'ring-1 ring-red-500' : ''}`}>
                        <div className="text-[10px] text-zinc-500 mb-1">身体</div>
                        <div className={`font-mono font-bold ${stats.body < FAIL_THRESHOLD ? 'text-red-500' : 'text-zinc-300'}`}>{stats.body}</div>
                    </div>
                    <div className={`text-center bg-white/5 rounded p-2 ${stats.mind < FAIL_THRESHOLD ? 'ring-1 ring-red-500' : ''}`}>
                        <div className="text-[10px] text-zinc-500 mb-1">心理</div>
                        <div className={`font-mono font-bold ${stats.mind < FAIL_THRESHOLD ? 'text-red-500' : 'text-zinc-300'}`}>{stats.mind}</div>
                    </div>
                    <div className={`text-center bg-white/5 rounded p-2 ${stats.moral < FAIL_THRESHOLD ? 'ring-1 ring-red-500' : ''}`}>
                        <div className="text-[10px] text-zinc-500 mb-1">道德</div>
                        <div className={`font-mono font-bold ${stats.moral < FAIL_THRESHOLD ? 'text-red-500' : 'text-zinc-300'}`}>{stats.moral}</div>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="text-xs font-mono text-zinc-400 mb-3 flex items-center gap-2">
                        <Radar size={12} /> 人格雷达 (PERSONALITY ARCHETYPE)
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <RadarBar label="实用主义" score={pScores.pragmatist} color="bg-blue-500" />
                        <RadarBar label="传统守护" score={pScores.traditional} color="bg-emerald-500" />
                        <RadarBar label="赛博赌徒" score={pScores.gambler} color="bg-rose-500" />
                        <RadarBar label="躺平大师" score={pScores.layflat} color="bg-zinc-400" />
                    </div>
                </div>

                {failCount >= 1 && (
                    <div className="text-center text-[10px] text-zinc-500 font-mono mt-4 pt-2 border-t border-zinc-800">
                        {playCount >= 3 ? '系统检测到多次重启... 最终程序已就绪。' : '检测到生命体征微弱，是否请求重启？'}
                    </div>
                )}
              </div>

              <button 
                onClick={handleAction}
                className="w-full py-4 bg-white text-black font-black text-xl rounded hover:bg-zinc-200 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {playCount >= 3 ? <Power size={24} /> : <RotateCcw size={24} />}
                {playCount >= 3 ? 'TERMINATE_PROCESS' : 'REBOOT_SYSTEM'}
              </button>
            </div>
        </div>
      </div>
    );
  }

  // --- EPILOGUE (Meta Ending) ---
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-black p-8 font-mono text-center animate-fade-in relative z-50">
      <div className="max-w-md space-y-8 relative z-10">
        <div className="text-6xl mb-4 opacity-20">
            <Ghost size={80} />
        </div>
        <p className="text-zinc-400 leading-loose">
          你已经重启了 {playCount} 次人生。<br/>
          每一次，你都以为自己能赢。<br/>
          但系统从未设计过“赢”的选项。<br/>
          所谓的“阶级跃升”，只是换了一个更高层的笼子。
        </p>
        <p className="text-red-500 font-bold animate-pulse">
          唯一的解脱，是关掉屏幕，<br/>
          回到你真实的、同样残酷的现实中去。
        </p>
        
        {canReboot && (
            <button 
                onClick={onRestart}
                className="mt-8 px-6 py-2 border border-zinc-800 text-zinc-600 text-xs hover:text-white hover:border-white transition-colors"
            >
                我不信邪 (强制重启)
            </button>
        )}
      </div>
      
      {!canReboot && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-600 text-xs flex items-center gap-2">
              <Clock size={12} className="animate-spin" />
              <span>系统冷却中... {epilogueTimer}s</span>
          </div>
      )}
    </div>
  );
};

export default EndingScreen;
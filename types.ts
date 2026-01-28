/**
 * © 2024 Cyber Execution Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

export type StatKey = 'cash' | 'body' | 'mind' | 'moral' | 'safeInvest' | 'riskyInvest' | 'performance';

export interface Stats {
  cash: number; // 流动现金
  safeInvest: number; // 稳健型投资 (定期/债券)
  riskyInvest: number; // 激进型投资 (股票/基金)
  body: number; // 身体
  mind: number; // 心理
  moral: number; // 道德
  performance: number; // 隐形绩效 (0-100)
}

export interface ChoiceEffect {
  stat: StatKey;
  value: number;
}

export interface Choice {
  id: string;
  text: string;
  description?: string; // Additional context for the choice
  effects: ChoiceEffect[];
  flag?: string; // Foreshadowing flag trigger
  riskLabel?: 'High Risk' | 'Low Risk' | 'Safe' | 'Rescue';
  nextEventId?: string; // If present, jump to sub-event
  disabled?: boolean; // NEW: If true, choice is visible but unclickable
  disabledReason?: string; // NEW: Reason shown when disabled
}

export interface NodeEventResult {
  text: string;
  effects: ChoiceEffect[];
  flags?: string[];
}

export interface SubEvent {
  id: string;
  title?: string;
  context: (flags: string[], stats: Stats) => string;
  choices: Choice[] | ((flags: string[], stats: Stats) => Choice[]); // Updated signature
}

// --- NEW SIMULATION TYPES ---
export type SimulationType = 'ALLOCATION' | 'NEGOTIATION' | 'CRISIS_RESOURCE' | 'CAILI_NEGOTIATION';

export interface SimulationConfig {
  type: SimulationType;
  totalPoints?: number; // For Allocation/Crisis
  categories?: { id: string; label: string; desc: string }[]; // For Allocation
  negotiationTarget?: string; // For Negotiation
}

export interface GameNode {
  id: string;
  month: number;
  title: string;
  news?: string; // NEW: News Ticker Text
  marketTrend?: 'BULL' | 'BEAR' | 'VOLATILE' | 'FLAT'; // NEW: Affects investment calculations
  context: (flags: string[], stats: Stats) => string;
  prevContext?: string;
  choices?: Choice[] | ((flags: string[], stats: Stats) => Choice[]); // Updated signature
  simulation?: SimulationConfig; // NEW: Triggers special UI
  onEnter?: (flags: string[], rng: number, stats: Stats) => NodeEventResult | null; // Updated to include stats for Karma check
  events?: Record<string, SubEvent>;
}

export interface RescueScenario {
  id: string;
  title: string;
  context: string;
  choices: Choice[];
}

export interface MonthlySummary {
  month: number;
  salary: number;
  rent: number;
  livingCost: number;
  safeYield: number; // New
  riskyYield: number; // New
  safeProfit: number; // New
  riskyProfit: number; // New
  debtInterest: number;
  totalChange: number;
  housingValuation?: number; // NEW: Estimated Value of House
  housingAppreciation?: number; // NEW: Value gained this period
  specialEvent?: string; // NEW: For displaying Networking success etc.
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name mapping
  isHidden?: boolean; // If true, details are hidden until unlocked
  condition?: (stats: Stats, flags: string[], history: string[]) => boolean;
}

export enum GameStage {
  INTRO = 'INTRO',
  CONFIG = 'CONFIG',
  PLAYING = 'PLAYING',
  SUMMARY = 'SUMMARY', // New stage for monthly report
  ENDING = 'ENDING',
}

export interface GameState {
  stage: GameStage;
  currentNodeIndex: number;
  stats: Stats;
  history: string[];
  flags: string[];
  lastEventLog?: string;
  rngSeed: number;
  activeRescue?: RescueScenario;
  currentSubEventId?: string;
  lastSummary?: MonthlySummary; // Store last month's calculation
  isLegacyRun?: boolean; // NEW: Track if this is a NG+ run
  lastRescueNodeIndex: number; // NEW: Track when the last rescue happened to prevent loops
}
/**
 * © 2024 City Survival Line. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */

import { GameNode, Stats, ChoiceEffect, RescueScenario, Choice, SubEvent, StatKey, Achievement } from './types';

export const INITIAL_STATS: Stats = {
  cash: 50000, 
  safeInvest: 0,
  riskyInvest: 0,
  body: 60,
  mind: 60,
  moral: 60,
  performance: 50, // Initial implicit performance
};

// ECONOMY TUNING (User Feedback Optimized)
// Target: Salary (6000) - Living (3000) - SuburbRent (2500) = +500 Surplus.
export const BASE_SALARY = 6000; 
export const LIVING_COST = 3000; // Lowered from 4500 to realistic survival level

// --- ACHIEVEMENT DEFINITIONS ---
export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'ach_first_step',
        title: '漂泊的开始',
        description: '完成开局配置，正式进入城市生存游戏。',
        icon: 'Footprints'
    },
    {
        id: 'ach_homeowner',
        title: '不动产大亨',
        description: '在这座城市拥有一套属于自己的房子（无论是否背负房贷）。',
        icon: 'Home',
        condition: (stats, flags) => flags.includes('OWN_HOUSE')
    },
    {
        id: 'ach_debt_king',
        title: '深渊凝视',
        description: '触发“高利贷崩盘”或陷入严重债务危机。',
        icon: 'Skull',
        condition: (stats, flags) => flags.includes('DEBT_TRAP') || stats.cash < -20000
    },
    {
        id: 'ach_millionaire',
        title: '第一桶金',
        description: '流动资金或总资产超过 30 万。',
        icon: 'Gem',
        condition: (stats) => (stats.cash + stats.safeInvest + stats.riskyInvest) >= 300000
    },
    {
        id: 'ach_layflat',
        title: '咸鱼哲学',
        description: '彻底贯彻躺平主义，不争不抢。',
        icon: 'Coffee',
        condition: (stats, flags) => flags.includes('LAY_FLAT') || flags.includes('GIVE_UP')
    },
    {
        id: 'ach_saint',
        title: '道德楷模',
        description: '在物欲横流的城市中保持极高的道德水准 (道德 > 90)。',
        icon: 'Scale',
        condition: (stats) => stats.moral >= 90
    },
    {
        id: 'ach_dark_forest',
        title: '黑暗森林',
        description: '为了生存不择手段 (道德 < 10)。',
        icon: 'VenetianMask',
        isHidden: true,
        condition: (stats) => stats.moral <= 10
    },
    {
        id: 'ach_survivor',
        title: '生存大师',
        description: '成功撑过24个月，迎来最终结局。',
        icon: 'Flag',
        condition: (stats, flags, history) => history.includes('n11-end') || history.includes('node-11') // Loosely check if reached end node
    },
    {
        id: 'ach_investor',
        title: '华尔街之狼',
        description: '投资账户（稳健+激进）总额超过 20 万。',
        icon: 'TrendingUp',
        condition: (stats) => (stats.safeInvest + stats.riskyInvest) >= 200000
    },
    {
        id: 'ach_entrepreneur',
        title: '创客精神',
        description: '选择下海创业，成为自己的老板。',
        icon: 'Briefcase',
        condition: (stats, flags) => flags.includes('ENTREPRENEUR')
    },
    {
        id: 'ach_criminal',
        title: '绝命毒师',
        description: '走上违法犯罪的道路，成为地下世界的亡命徒。',
        icon: 'Siren',
        isHidden: true,
        condition: (stats, flags) => flags.includes('CRIMINAL')
    }
];

// --- DYNAMIC RESCUE LOGIC (REALISTIC) ---
// ... (Rescue logic remains mostly same, just ensuring exports)
const RESCUE_CASH: RescueScenario = {
  id: 'rescue-cash',
  title: '⚠️ 红色警报：至暗时刻',
  context: '【资金链崩断】最后一张信用卡被刷爆的瞬间，世界安静了。催收的电话不再是威胁，而是你与这个社会唯一的联系。房东站在门口，眼神像看着一件过期商品。',
  choices: [
    { id: 'rc-c1', text: '签署高息网贷 (现金+2万)', description: '饮鸩止渴。获得救命钱，但你隐约看到了深渊的凝视。', effects: [{ stat: 'cash', value: 20000 }, { stat: 'mind', value: -15 }, { stat: 'moral', value: -10 }], flag: 'DEBT_TRAP' },
    { id: 'rc-c2', text: '夜间体力兼职 (现金+8k)', description: '透支身体。用汗水和尊严换取生存的权利。', effects: [{ stat: 'cash', value: 8000 }, { stat: 'body', value: -20 }, { stat: 'mind', value: -5 }, { stat: 'performance', value: -10 }] },
  ],
};

const RESCUE_BODY: RescueScenario = {
  id: 'rescue-body',
  title: '⚠️ 红色警报：彻底倒下',
  context: '【身体垮塌】在连续加班后的地铁上，你听到了自己心跳漏拍的声音。眼前一黑，再睁眼时是医院惨白的天花板。医生说你的各项指标像个八十岁的老人。',
  choices: [
    { id: 'rb-c1', text: '住院全面治疗 (现金-1.5万)', description: '停机维护。昂贵但必要，这是给生命充值的代价。', effects: [{ stat: 'body', value: 50 }, { stat: 'cash', value: -15000 }, { stat: 'performance', value: -20 }] },
    { id: 'rb-c2', text: '输液强撑出院 (现金-2000)', description: '打着吊瓶继续跑。你是一台停不下来的机器，修修补补又三年。', effects: [{ stat: 'body', value: 30 }, { stat: 'mind', value: -10 }, { stat: 'cash', value: -2000 }] },
  ],
};

const RESCUE_MIND: RescueScenario = {
  id: 'rescue-mind',
  title: '⚠️ 红色警报：精神崩溃',
  context: '【心理防线决堤】你站在公司天台抽烟，看着楼下如蝼蚁般的车流，脑海中突然冒出一个可怕的念头：“跳下去会不会很自由？”你无法控制地流泪，无法阅读任何文字。',
  choices: [
    { id: 'rm-c1', text: '心理咨询干预 (现金-8k)', description: '昂贵的谈话。用钱买回理智，虽然很贵，但很有用。', effects: [{ stat: 'mind', value: 50 }, { stat: 'cash', value: -8000 }] },
    { id: 'rm-c2', text: '家里蹲自我封闭 (无收入)', description: '物理隔绝。切断与世界的联系，在黑暗中独自舔舐伤口。', effects: [{ stat: 'mind', value: 30 }, { stat: 'body', value: -10 }, { stat: 'moral', value: -5 }, { stat: 'performance', value: -30 }], flag: 'GIVE_UP' },
  ],
};

const RESCUE_MORAL: RescueScenario = {
  id: 'rescue-moral',
  title: '⚠️ 红色警报：社会性死亡',
  context: '【信誉破产】谎言像滚雪球一样炸了。借钱不还、甚至动了歪心思的事情败露。你在朋友圈里已经是个“死人”，昔日好友像躲瘟神一样躲着你。',
  choices: [
    { id: 'rmo-c1', text: '变卖资产还债 (现金-2万)', description: '最后的救赎。只为买回一张做人的入场券，哪怕一贫如洗。', effects: [{ stat: 'moral', value: 50 }, { stat: 'cash', value: -20000 }, { stat: 'mind', value: -10 }] },
    { id: 'rmo-c2', text: '跑路人间蒸发 (现金+5k)', description: '彻底黑化。你换了城市和名字，既然做不了好人，那就做个幽灵。', effects: [{ stat: 'cash', value: 5000 }, { stat: 'moral', value: -30 }], flag: 'SCAMMER' },
  ],
};

export const determineRescueScenario = (
    stats: Stats, 
    flags: string[] = [], 
    currentNodeIndex: number = -1, 
    lastRescueNodeIndex: number = -99
): RescueScenario | undefined => {
  
  // COOLDOWN CHECK
  if (currentNodeIndex - lastRescueNodeIndex <= 1) {
      return undefined;
  }

  const THRESHOLDS = { 
      cash: -3000, 
      body: 10, 
      mind: 10, 
      moral: 10 
  };
  
  const isScammer = flags.includes('SCAMMER');
  const hasGivenUp = flags.includes('GIVE_UP');

  // Health/Mind failures take priority
  if (stats.body < THRESHOLDS.body) return RESCUE_BODY;
  if (stats.mind < THRESHOLDS.mind && !hasGivenUp) return RESCUE_MIND;

  // Debt Trap Trigger
  if (flags.includes('DEBT_TRAP') && stats.cash < -10000) {
      const totalInvest = stats.safeInvest + stats.riskyInvest;
      const debtAmount = Math.abs(stats.cash);
      const sellAmount = Math.min(totalInvest, debtAmount + 5000); 
      // KARMA SYSTEM: If Moral is low or Scammer, friends won't help
      const canBorrowFriend = stats.moral >= 40 && !isScammer && !flags.includes('SOCIAL_ISOLATION');

      return {
          id: 'rescue-debt-collection',
          title: '⚠️ 红色警报：暴力催收',
          context: `【高利贷崩盘】你逾期了。催收人员堵在你的门口，红油漆泼满了走廊。你必须立刻筹钱。\n\n当前负债: ¥${debtAmount.toLocaleString()}\n可变卖投资资产: ¥${totalInvest.toLocaleString()}`,
          choices: [
              {
                  id: 'rdc-sell',
                  text: `变卖资产还债 (投资-${(sellAmount/1000).toFixed(1)}k)`,
                  description: '忍痛割肉。将你辛苦攒下的理财/股票全部低价变现。',
                  effects: [{ stat: 'cash', value: sellAmount }, { stat: 'safeInvest', value: -stats.safeInvest }, { stat: 'riskyInvest', value: -stats.riskyInvest }, { stat: 'mind', value: -15 }],
                  disabled: totalInvest < 1000,
                  disabledReason: '无资产可卖'
              },
              {
                  id: 'rdc-friend',
                  text: `欺骗朋友借款 (现金+${(debtAmount/1000).toFixed(1)}k)`,
                  description: canBorrowFriend ? '透支最后的人情。获得标签：众叛亲离。' : '【无法选择】你的信誉已破产，没人会借给你。',
                  effects: [{ stat: 'cash', value: debtAmount + 2000 }, { stat: 'moral', value: -40 }, { stat: 'mind', value: -15 }],
                  flag: 'SOCIAL_ISOLATION',
                  disabled: !canBorrowFriend,
                  disabledReason: '信誉破产 (Bad Karma)'
              }
          ]
      };
  }

  if (stats.cash < THRESHOLDS.cash) return RESCUE_CASH;
  if (stats.moral < THRESHOLDS.moral && !isScammer) return RESCUE_MORAL;

  return undefined;
};

export const RESCUE_SCENARIOS = {}; 

// --- GAME NODES ---
export const GAME_NODES: GameNode[] = [
  // --- NODE 0: DIVERGENT START ---
  {
    id: 'node-0',
    month: 2,
    title: '阶段一：磨合 (生存空间)',
    news: '📈 市场快讯：一线城市房租同比上涨8%，通勤时间成为年轻人辞职首因。',
    marketTrend: 'FLAT',
    context: (flags) => {
      const isCity = flags.includes('RENT_CITY');
      if (isCity) {
          return `【市区：水泥森林】\n入住两个月，高昂的房租并没有带来预期的便利。隔壁住着一个凌晨两点还在直播的带货主播，楼下非法改装的烧烤摊油烟顺着窗缝往里钻。你每天是在噪音和地沟油味中惊醒的，神经衰弱的征兆开始显现。`;
      } else {
          return `【远郊：睡城梦魇】\n入住两个月，你体会到了“被通勤吞噬的人生”。每天往返3.5小时，你在地铁里被挤成肉饼，看着窗外掠过的荒地，感觉自己像个每晚回巢充电的干电池。今早地铁故障，你又迟到了。`;
      }
    },
    choices: (flags) => {
      const isCity = flags.includes('RENT_CITY');
      if (isCity) {
          // CITY CHOICES: Focus on Environment & Neighbors
          return [
            {
              id: 'n0-c-city-fix',
              text: '购买降噪/新风设备 (现金-2500)',
              description: '花钱买命。用金钱换取物理上的舒适，虽然肉痛，但立竿见影。',
              effects: [{ stat: 'cash', value: -2500 }, { stat: 'mind', value: 15 }, { stat: 'body', value: 5 }], 
              nextEventId: 'n0-sub-city-pay'
            },
            {
              id: 'n0-c-city-fight',
              text: '上门交涉/投诉 (社交博弈)',
              description: '试图用沟通解决问题。这是一场博弈，对方也是为了生存的普通人，可能谈和，也可能激化矛盾。',
              effects: [], 
              riskLabel: 'Low Risk',
              nextEventId: 'n0-sub-city-talk'
            },
            {
              id: 'n0-c-city-endure',
              text: '硬抗忍受，房东减租 (现金+500)',
              description: '穷人的修行。在噪音中冥想。省下了钱，但这种压抑正在积攒。',
              effects: [{ stat: 'body', value: -5 }, { stat: 'mind', value: -20 }, { stat: 'cash', value: 500 }], 
              nextEventId: 'n0-sub-city-endure'
            }
          ];
      } else {
          // SUBURB CHOICES: Focus on Commute & Time
          return [
            {
              id: 'n0-c-suburb-taxi',
              text: '偶尔打车/拼车 (现金-1500)',
              description: '用金钱换时间。每个月多花一笔交通费，换取多睡一小时和体面的妆容。',
              effects: [{ stat: 'cash', value: -1500 }, { stat: 'body', value: 10 }, { stat: 'performance', value: 5 }], 
              nextEventId: 'n0-sub-suburb-taxi'
            },
            {
              id: 'n0-c-suburb-grind',
              text: '极限通勤/站着睡 (体力-20)',
              description: '这是对意志力的磨炼。你在拥挤的车厢里练就了站立睡眠的神功，省下了钱，但透支了膝盖和精神。',
              effects: [{ stat: 'body', value: -20 }, { stat: 'mind', value: -5 }, { stat: 'cash', value: 500 }], 
              nextEventId: 'n0-sub-suburb-grind'
            },
            {
              id: 'n0-c-suburb-move',
              text: '寻找公司附近床位 (现金-2000)',
              description: '极端操作。周一至周五住公司附近的胶囊旅馆，周末回郊区。虽然像个流浪汉，但效率极高。',
              effects: [{ stat: 'cash', value: -2000 }, { stat: 'performance', value: 15 }, { stat: 'mind', value: -10 }], 
              flag: 'WEEKDAY_RENTER',
              nextEventId: 'n0-sub-suburb-move'
            }
          ];
      }
    },
    events: {
      // --- CITY EVENTS ---
      'n0-sub-city-pay': {
        id: 'n0-sub-city-pay',
        context: () => '世界终于安静了。但看着银行卡扣款短信，这笔额外的固定支出让你本不富裕的现金流雪上加霜。为了平衡收支，你必须做出取舍：',
        choices: [
          { id: 'n0-cp-a', text: '消费降级 (身体-10)', description: '外卖换挂面，水果换维生素。', effects: [{stat:'cash', value:500}, {stat:'body', value:-10}], nextEventId: 'n0-final' },
          { id: 'n0-cp-b', text: '兼职回血 (精力-15)', description: '既然花了钱，就得赚回来。利用碎片时间接单。', effects: [{stat:'cash', value:1000}, {stat:'performance', value:-15}, {stat:'body', value:-5}], nextEventId: 'n0-final' }
        ]
      },
      'n0-sub-city-talk': {
        id: 'n0-sub-city-talk',
        context: () => '开门的是个顶着黑眼圈的年轻人。他苦笑着展示了满屋的库存：“哥/姐，我也没办法，完不成KPI就要被扣钱。要不这样，你帮我刷刷单，我尽量11点前结束？”',
        choices: [
          { id: 'n0-ct-deal', text: '帮忙刷单换安宁', description: '灰色交易。虽然恶心，但确实有效且省钱，还拿了点回扣。', effects: [{stat:'mind', value:-10}, {stat:'moral', value:-5}, {stat:'cash', value: 200}], flag: 'GRAY_AREA', nextEventId: 'n0-final' },
          { id: 'n0-ct-fight', text: '威胁投诉/报警', description: '拒绝被绑架。虽然守住了底线，但邻里关系降至冰点，你要时刻提防报复。', effects: [{stat:'mind', value:-5}, {stat:'moral', value:5}], nextEventId: 'n0-final' }
        ]
      },
      'n0-sub-city-endure': {
        id: 'n0-sub-city-endure',
        context: () => '你买了一副廉价耳塞。噪音变闷了，像隔着水膜。你在这种混沌中度过了两个月，脾气变得越来越暴躁。',
        choices: [{ id: 'n0-ce-confirm', text: '继续忍受', description: '生活就是忍耐。', effects: [] }]
      },
      
      // --- SUBURB EVENTS ---
      'n0-sub-suburb-taxi': {
        id: 'n0-sub-suburb-taxi',
        context: () => '拼车群里的司机是个话痨，每天两小时向你推销他的“副业”和人生哲学。虽然不用挤地铁，但这是一种精神折磨。',
        choices: [
          { id: 'n0-st-social', text: '假装感兴趣捧场', description: '建立虚假的社交关系，或许以后用得上？', effects: [{stat:'mind', value:-5}, {stat:'moral', value:-5}], flag: 'NETWORK_UP', nextEventId: 'n0-final' },
          { id: 'n0-st-ignore', text: '戴耳机装睡', description: '保持冷漠。司机觉得你是个怪人，有时会故意绕路。', effects: [{stat:'mind', value:5}], nextEventId: 'n0-final' }
        ]
      },
      'n0-sub-suburb-grind': {
        id: 'n0-sub-suburb-grind',
        context: () => '你在地铁上见过凌晨六点的城市，也见过各种人生百态。有人在哭，有人在吃早饭，有人在背单词。你感觉自己正在慢慢变成这庞大机器上的一颗生锈螺丝。',
        choices: [{ id: 'n0-sg-confirm', text: '麻木前行', description: '这就是大多数人的生活。', effects: [] }]
      },
      'n0-sub-suburb-move': {
        id: 'n0-sub-suburb-move',
        context: () => '周五晚上回到郊区的家，看着空荡荡的房间，你突然觉得这里不是家，只是一个昂贵的仓库。这种双栖生活让你产生了严重的撕裂感。',
        choices: [{ id: 'n0-sm-confirm', text: '这是为了效率', description: '一切为了工作。', effects: [] }]
      },

      'n0-final': {
        id: 'n0-final',
        context: (flags) => `两个月即将过去。就在你以为生活步入正轨时，${flags.includes('RENT_CITY') ? '老房子的下水道突然反涌，脏水毁了你的地毯。' : '小区外的地铁站突然宣布封站施工，你需要绕路3公里。'}\n\n现实总是在你松懈时给你一记耳光。`,
        choices: (flags, stats) => [
          { id: 'n0-f-a', text: '花钱消灾 (现金-800)', description: flags.includes('RENT_CITY') ? '请专业保洁/住酒店。' : '只能打黑车接驳。', effects: [{stat:'cash', value:-800}, {stat:'mind', value:5}], disabled: stats.cash < 800, disabledReason: '余额不足' },
          { id: 'n0-f-b', text: '肉体抗压 (体力/心情-)', description: flags.includes('RENT_CITY') ? '自己清理恶臭的脏水。' : '骑共享单车冲刺3公里。', effects: [{stat:'body', value:-15}, {stat:'mind', value:-15}] }
        ]
      }
    }
  },
  // --- NODE 1: DIVERGENT ANXIETY ---
  {
    id: 'node-1',
    month: 4,
    title: '阶段一：磨合 (迷茫期)',
    news: '📰 职场观察：35岁现象年轻化，28岁成为大厂优化的新门槛。',
    marketTrend: 'FLAT',
    context: (flags) => {
      const isCity = flags.includes('RENT_CITY');
      const isWeekdayRenter = flags.includes('WEEKDAY_RENTER'); // Check for specific suburb lifestyle

      if (isCity) {
          return `【市区：月光陷阱】\n入职第四个月。你住在繁华的中心，下楼就是便利店和酒吧。同事们下班总喜欢喊你聚餐，“反正你住得近”。\n虽然通勤轻松，但高昂的房租和无法拒绝的社交支出，让你成了标准的“月光族”。看着账户余额，你陷入了“假装中产”的焦虑。`;
      } else {
          if (isWeekdayRenter) {
              return `【双栖生活：异乡人】\n入职第四个月。周一到周五，你蜷缩在公司附近的胶囊舱里，听着隔壁的呼噜声入睡；周末回到远郊空荡荡的房子，像个定期打扫卫生的钟点工。\n虽然避开了通勤地狱，绩效也名列前茅，但这种把生活压缩到极致的“高效”，让你感觉自己正在异化成一个纯粹的工作零件。`;
          }
          return `【远郊：时间黑洞】\n入职第四个月。你像是过着双重生活：白天是CBD的精英，晚上是城乡结合部的幽灵。\n每天到家已是九点，除了洗澡睡觉什么都做不了。父母打来电话问近况，你发现自己除了工作和地铁，大脑一片空白。你感觉自己正在废掉。`;
      }
    },
    choices: (flags) => {
      const isCity = flags.includes('RENT_CITY');
      if (isCity) {
          // CITY: Focus on Money & Temptation
          return [
            { id: 'n1-c-city-hustle', text: '开展副业/兼职 (现金+2k)', description: '【搞钱】利用地段优势，下班后跑腿/摆摊/代驾。身体很累，但看到钱进账才踏实。', effects: [{ stat: 'cash', value: 2000 }, { stat: 'body', value: -15 }, { stat: 'performance', value: -5 }], nextEventId: 'n1-sub-city-hustle' },
            { id: 'n1-c-city-social', text: '无效社交/混圈子 (现金-2k)', description: '【人脉】频繁参加聚局。虽然花钱，但你希望能认识“贵人”。这是一场赌博。', effects: [{ stat: 'cash', value: -2000 }, { stat: 'mind', value: 5 }], flag: 'NETWORK_UP', nextEventId: 'n1-sub-city-social' },
            { id: 'n1-c-city-save', text: '极简宅家 (省钱)', description: '【苟住】拒绝一切邀约，下班立刻回家锁门。虽然被同事视为“怪人”，但终于存下了点钱。', effects: [{ stat: 'cash', value: 1000 }, { stat: 'mind', value: -10 }, { stat: 'performance', value: -5 }], flag: 'GIVE_UP', nextEventId: 'n1-sub-play' }
          ];
      } else {
          // SUBURB: Focus on Time & Upskilling
          return [
            { id: 'n1-c-suburb-study', text: '地铁学习/考公 (精力-20)', description: '【卷】在摇晃的车厢里背单词、刷题。这是你唯一能挤出的时间。效率极低，但聊胜于无。', effects: [{ stat: 'performance', value: -10 }, { stat: 'mind', value: -10 }, { stat: 'moral', value: 5 }], flag: 'CIVIL_PREP', nextEventId: 'n1-sub-suburb-study' },
            { id: 'n1-c-suburb-course', text: '周末报班进修 (现金-1.5w)', description: '【赌】牺牲周末，往返市区上课。高昂的学费和路费让你肉痛，这是孤注一掷的投资。', effects: [{ stat: 'cash', value: -15000 }, { stat: 'mind', value: 5 }, { stat: 'performance', value: 5 }], flag: 'SKILL_UP', nextEventId: 'n1-sub-suburb-course' },
            { id: 'n1-c-suburb-sleep', text: '彻底躺平回血 (身体+15)', description: '【养生】承认自己只是个凡人。下班就睡觉，周末晒太阳。放弃了竞争，但也拥有了健康。', effects: [{ stat: 'body', value: 15 }, { stat: 'mind', value: 10 }, { stat: 'performance', value: -5 }], flag: 'LAY_FLAT', nextEventId: 'n1-sub-play' }
          ];
      }
    },
    events: {
      // CITY SUB-EVENTS
      'n1-sub-city-hustle': {
        id: 'n1-sub-city-hustle',
        context: () => '你在深夜的街头穿梭。看着那些醉生梦死的人，你觉得自己像个局外人。你赚到了房租，但感觉自己正在从“白领”退化为“体力劳工”。',
        choices: [{ id: 'n1-ch-confirm', text: '这钱赚得踏实', description: '汗水不会骗人。', effects: [{stat:'mind', value:5}] }]
      },
      'n1-sub-city-social': {
        id: 'n1-sub-city-social',
        context: () => '酒过三巡，你加了一堆大佬的微信。第二天醒来，发现除了点赞之交，并没有什么实质性的帮助。但你在这个虚幻的圈子里获得了一种“我很重要”的错觉。',
        choices: [{ id: 'n1-cs-confirm', text: '继续伪装', description: '也许下一个就是机会。', effects: [{stat:'mind', value:-5}] }]
      },
      
      // SUBURB SUB-EVENTS
      'n1-sub-suburb-study': {
        id: 'n1-sub-suburb-study',
        context: () => '信号时断时续，旁边的大爷在看抖音外放。你在这种环境下坚持了两个月，虽然进度缓慢，但你感动了自己。',
        choices: [{ id: 'n1-ss-confirm', text: '精神胜利法', description: '我在努力，我在前进。', effects: [{stat:'mind', value:5}] }]
      },
      'n1-sub-suburb-course': {
        id: 'n1-sub-suburb-course',
        context: () => '周末的清晨，你比上班起得还早。坐在教室里，周围是比你年轻十岁、精力充沛的应届生。你感到了深深的代沟和体力不支。',
        choices: [{ id: 'n1-sc-confirm', text: '咬牙坚持', description: '不能让学费打水漂。', effects: [{stat:'body', value:-10}] }]
      },

      'n1-sub-play': {
        id: 'n1-sub-play',
        context: () => '【电子麻醉】最终，你还是回到了舒适区。手机屏幕的光照亮了你疲惫的脸。你也知道这是逃避，但这一刻的快乐是真实的。',
        choices: [
          { id: 'n1-pl-a', text: '沉迷虚拟世界', description: '游戏、短视频。时间过得很快，直到凌晨三点的空虚感袭来。', effects: [{stat:'mind', value:5}, {stat:'body', value:-10}] },
          { id: 'n1-pl-b', text: '发展廉价爱好', description: '比如跑步、看书。虽然枯燥，但至少对身体无害。', effects: [{stat:'body', value:10}, {stat:'mind', value:5}] }
        ]
      }
    }
  },
  // --- NODE 2: REFINED ---
  {
    id: 'node-2',
    month: 6,
    title: '阶段一：磨合 (时间货币)',
    news: '🚀 财经头条：新兴科技概念股大热，市场情绪高涨。',
    marketTrend: 'BULL',
    context: () => `近期，迎来了全民狂欢的“黄金周”。\n这是打工人为数不多的可以自主支配的时间。这7天是你仅有的硬通货。你是选择修复肉体、放飞灵魂，还是将其变现？\n(注：这是一个资源分配模拟，不同的侧重会带来不同的Buff或Debuff)`,
    simulation: {
      type: 'ALLOCATION',
      totalPoints: 7, 
      categories: [
        { id: 'rest', label: '宅家补觉', desc: '低成本恢复，但不仅是睡觉，还包括发呆。' },
        { id: 'travel', label: '特种兵旅游', desc: '高强度打卡。消耗大量金钱和体力，获得朋友圈素材。' },
        { id: 'work', label: '加班/兼职', desc: '假期三倍薪资/接私活。透支身体换取现金。' }
      ]
    }
  },
  // --- NODE 3 ---
  {
    id: 'node-3',
    month: 8,
    title: '阶段二：瓶颈 (职场丛林)',
    news: '📉 行业震荡：某巨头财报不及预期，带崩大盘，市场恐慌情绪蔓延。',
    marketTrend: 'BEAR',
    context: () => '公司内部派系斗争白热化。主管A是实干派，但被边缘化；主管B是马屁精，深得老板欢心。现在他们同时要求你在周末加班支持他们的项目。\n\n这不仅仅是加班，这是站队。高强度的压力让你的身体发出了警报，但你必须做出选择。',
    onEnter: (flags, rng, stats) => {
        if (stats.moral < 30) {
            return {
                text: '【现世报】由于你之前的冷漠或不道德行为，你在同事中的口碑极差。没人愿意在这个关头给你透露任何内部消息，你只能盲选。心理压力激增。',
                effects: [{ stat: 'mind', value: -15 }]
            };
        }
        return null;
    },
    choices: (flags, stats) => {
      const isSubHealth = stats.body < 40;
      return [
        { id: 'n3-c1', text: '投靠实干派A (高强度工作)', description: '跟着他能学到真东西，但项目强度极大。准备好掉头发吧。', effects: [{ stat: 'mind', value: 10 }, { stat: 'cash', value: 0 }, { stat: 'body', value: -15 }, { stat: 'performance', value: 20 }], disabled: isSubHealth, disabledReason: '身体亚健康 (Body < 40)', nextEventId: 'n3-sub-skill-health' },
        { id: 'n3-c2', text: '巴结马屁精B (酒局应酬)', description: '背靠大树好乘凉。违心地写PPT吹捧，并参与高频酒局。虽然恶心，但会有实际的奖金回报。', effects: [{ stat: 'moral', value: -20 }, { stat: 'cash', value: 3000 }, { stat: 'mind', value: -15 }, { stat: 'performance', value: 15 }], nextEventId: 'n3-sub-politics-health' },
        { id: 'n3-c3', text: '拒绝站队 (现金-2000)', description: '我只做分内事。两边都不得罪，也两边都不讨好。为了躲清静，你少拿了绩效。', effects: [{ stat: 'body', value: 5 }, { stat: 'cash', value: -2000 }, { stat: 'performance', value: -15 }], nextEventId: 'n3-sub-neutral' }
      ];
    },
    events: {
      'n3-sub-skill-health': { 
        id: 'n3-sub-skill-health',
        context: (flags) => `项目做得很成功，但主管A被排挤走了。你学到了技术，但也累垮了身体。\n\n就在项目交付的当晚，你突发【急性肠胃炎】倒在了工位上。同事把你送到了医院。\n\n(检测到你${flags.includes('INS_YES') ? '拥有' : '未购买'}商业补充险)`,
        choices: (flags) => {
            const hasIns = flags.includes('INS_YES');
            if (hasIns) {
                return [{ id: 'n3-h-a', text: '商业保险报销 (现金-0)', description: '【爽文体验】你住进了私立病房，专人护理，全额报销。你喝着从容的粥，看着隔壁排队的人，第一次觉得这钱花得值。', effects: [{stat:'body', value:10}, {stat:'mind', value:10}] }];
            } else {
                return [{ id: 'n3-h-b', text: '自费急诊 (现金-3000)', description: '【社畜悲歌】急诊排队4小时，医生开了堆自费药。你看着缴费单，觉得刚才加的班都白加了。', effects: [{stat:'cash', value:-3000}, {stat:'mind', value:-15}, {stat:'body', value:5}] }];
            }
        }
      },
      'n3-sub-politics-health': { 
        id: 'n3-sub-politics-health',
        context: (flags) => `你帮主管B挡了三轮酒，喝到胃出血。他在老板面前大出风头，给了你几千块奖金打发你。\n\n凌晨三点，你疼得在出租屋打滚，必须去医院。\n\n(检测到你${flags.includes('INS_YES') ? '拥有' : '未购买'}商业补充险)`,
        choices: (flags) => {
            const hasIns = flags.includes('INS_YES');
            if (hasIns) {
                return [{ id: 'n3-hp-a', text: '商业保险报销 (现金-0)', description: '【顶级保障】虽然是酒精性损伤，但你的高端医疗险依然覆盖了急诊和留观费用。你躺在舒适的病床上发誓再也不喝了。', effects: [{stat:'body', value:5}, {stat:'mind', value:5}] }];
            } else {
                return [{ id: 'n3-hp-b', text: '自费洗胃/输液 (现金-4000)', description: '【惨痛代价】救护车、洗胃、输液。医保报销有限，你不仅把奖金搭进去了，还倒贴了不少。', effects: [{stat:'cash', value:-4000}, {stat:'mind', value:-20}, {stat:'body', value:0}] }];
            }
        }
      },
      'n3-sub-neutral': {
        id: 'n3-sub-neutral',
        context: () => '你周末睡了个好觉。周一回到公司，发现大家都有意无意地避开你。你成了团队里的“透明人”。虽然没人管你，但年底的绩效奖金显然与你无缘了。',
        choices: [
          { id: 'n3-n-a', text: '接私活薅羊毛 (现金+3000)', description: '既然公司无视我，我就利用公司资源做私活。身心俱疲但钱包鼓了。', effects: [{stat:'cash', value:3000}, {stat:'body', value:-20}, {stat:'moral', value:-10}] },
          { id: 'n3-n-b', text: '带薪养生 (现金-1500)', description: '把公司当疗养院。虽然损失了绩效奖金，但至少保住了发际线。', effects: [{stat:'body', value:15}, {stat:'cash', value:-1500}] }
        ]
      }
    }
  },
  // --- NODE 4 ---
  {
    id: 'node-4',
    month: 10,
    title: '阶段二：瓶颈 (情感博弈)',
    news: '📊 消费观察：年轻人消费降级，但黄金和理财产品销量激增。',
    marketTrend: 'FLAT',
    context: () => '你当下的感情生活像一杯温开水，稳定但乏味。此时，你在行业聚会上遇到了一个“白月光”——对方幽默、多金、懂你，且频频向你示好。\n\n一边是多年的陪伴，一边是致命的诱惑。你的选择不仅关乎道德，更关乎你的钱包和未来。',
    choices: [
      { id: 'n4-c1', text: '坚守底线，维护现任 (现金-6k)', description: '拒绝诱惑。为了弥补内心的波澜，你决定给女友买一份昂贵的礼物，试图找回激情。', effects: [{ stat: 'cash', value: -6000 }, { stat: 'moral', value: 15 }, { stat: 'mind', value: 5 }], flag: 'LOVE_STABLE', nextEventId: 'n4-sub-loyal' },
      { id: 'n4-c2', text: '暧昧不清，左右逢源', description: '成年人不做选择。你享受着白月光的情绪价值，又不想放弃现任的安稳。这是在钢丝上跳舞。', effects: [{ stat: 'mind', value: 25 }, { stat: 'moral', value: -25 }], flag: 'LOVE_COMPLEX', nextEventId: 'n4-sub-affair' },
      { id: 'n4-c3', text: '断情绝爱，专注搞钱 (现金+1500)', description: '“女人只会影响我拔刀的速度。”你谁都不想选，把约会的时间用来跑兼职。', effects: [{ stat: 'cash', value: 1500 }, { stat: 'mind', value: -15 }, { stat: 'body', value: -10 }], flag: 'SINGLE_DOG', nextEventId: 'n4-sub-single' }
    ],
    events: {
      'n4-sub-loyal': {
        id: 'n4-sub-loyal',
        context: () => '为了对抗那个多金“白月光”带来的威胁感，你产生了一种雄性的胜负欲。你不想承认自己“养不起”她，于是你决定用真金白银来维护这段关系。',
        choices: [
            { id: 'n4-ly-a', text: '昂贵的浪漫 (现金-6000)', description: '咬牙买下了那个她收藏已久的包包，或者预订了豪华海景房。她惊喜地发了朋友圈，你保住了面子和地位。但下个月的信用卡账单，需要你吃很久的泡面来填补。', effects: [{stat:'cash', value:-6000}, {stat:'mind', value:15}, {stat:'performance', value:5}] },
            { id: 'n4-ly-b', text: '低成本陪伴 (现金+1000)', description: '激情退去，只剩柴米油盐。省钱过日子，但你开始厌恶这种一眼望到头的平庸。', effects: [{stat:'cash', value:1000}, {stat:'mind', value:-20}] }
        ]
      },
      'n4-sub-affair': {
        id: 'n4-sub-affair',
        context: () => '你体验到了久违的心跳。白月光带你去了很多高档场所，你的眼界开阔了，但也开始嫌弃现任的“平庸”。纸终究包不住火。',
        choices: [
          { id: 'n4-af-a', text: '双面生活', description: '由于要两头瞒，你必须花费双倍的精力。透支身体来换取刺激。', effects: [{stat:'mind', value:10}, {stat:'body', value:-20}] },
          { id: 'n4-af-b', text: '内心煎熬', description: '负罪感让你夜不能寐，你开始变得神经质，害怕手机突然响起。', effects: [{stat:'moral', value:-20}, {stat:'mind', value:-20}] }
        ]
      },
      'n4-sub-single': {
        id: 'n4-sub-single',
        context: () => '孤独是赚钱的燃料。你看着银行卡数字增长，觉得这比任何人的晚安都让人安心。但深夜的空虚感偶尔会像潮水般袭来。',
        choices: [
          { id: 'n4-sg-a', text: '工作狂魔 (现金+2500)', description: '用工作填满所有时间。', effects: [{stat:'cash', value:2500}, {stat:'body', value:-20}, {stat:'performance', value: 15}] },
          { id: 'n4-sg-b', text: '深夜EMO', description: '失眠，刷着前任的动态，第二天顶着黑眼圈上班。', effects: [{stat:'mind', value:-20}, {stat:'body', value:-5}, {stat: 'performance', value: -10}] }
        ]
      }
    }
  },
  // --- NODE 5 (UPDATE: High Performance Choice) ---
  {
    id: 'node-5',
    month: 12,
    title: '阶段二：瓶颈 (生存分岔)',
    news: '📉 行业寒冬：某互联网大厂裁员20%，但核心技术岗薪资依然倒挂。',
    marketTrend: 'VOLATILE',
    context: (flags, stats) => {
      let base = '年底，寒风刺骨。公司业绩暴雷，裁员名单流出。你感觉头顶悬着一把达摩克利斯之剑。\n';
      const hasSkills = flags.includes('SKILL_UP') || flags.includes('NETWORK_UP');
      if (hasSkills) {
          base += '但因为你之前积累了技术或人脉，几个前同事拉你入伙创业。';
      } else {
          base += '你只能祈祷裁员名单上没有你，或者接受大幅降薪。';
      }
      if (stats.performance >= 80) {
          base += '\n\n与此同时，猎头打来了电话。虽然大环境不好，但你的高绩效表现吸引了竞对公司的注意。';
      }
      return base;
    },
    onEnter: (flags, rng, stats) => {
        let text = '';
        const effects: ChoiceEffect[] = [];
        const newFlags: string[] = [];

        if (stats.moral < 30) {
            text += '【现世报】你的低道德行为让你声名狼藉。前同事创业并没有邀请你。';
            effects.push({ stat: 'mind', value: -10 });
        }
        
        // Performance Check for Layoffs
        if (stats.performance < 40) {
            text += '\n【绩效考核不合格】HR 找你谈话了。因为你之前的“摸鱼”行为或效率低下，你被列入了裁员优化名单。留下的路被堵死了。';
            effects.push({ stat: 'mind', value: -15 });
            newFlags.push('PERF_LOW'); // Blocks the "Stay" option
        }

        return { text, effects, flags: newFlags };
    },
    choices: (flags, stats) => {
      const hasSkills = flags.includes('SKILL_UP') || flags.includes('NETWORK_UP');
      const canInvest = stats.cash >= 30000;
      const isPerfLow = flags.includes('PERF_LOW');
      const canPromote = stats.performance >= 80;

      return [
        {
          id: 'n5-c1',
          text: '下海创业/合伙 (现金-3w)',
          description: '不想打工了！搏一搏，单车变摩托。这是阶层跃升的唯一捷径，也是破产的快车道。',
          effects: [{ stat: 'cash', value: -30000 }, { stat: 'riskyInvest', value: 30000 }, { stat: 'mind', value: 20 }],
          flag: 'ENTREPRENEUR',
          disabled: !hasSkills || !canInvest,
          disabledReason: !hasSkills ? '缺乏技能/人脉' : '启动资金不足',
          nextEventId: 'n5-sub-startup'
        },
        {
          id: 'n5-c-promote',
          text: '跳槽涨薪 (薪资提升)',
          description: '【高绩效奖励】接受猎头邀请。薪资涨至8.5k/月，但新环境需要重新适应，且期权归零。',
          effects: [{ stat: 'performance', value: -40 }, { stat: 'safeInvest', value: -5000 }, { stat: 'mind', value: -10 }],
          flag: 'SALARY_BUMP',
          disabled: !canPromote,
          disabledReason: '绩效不足80',
          nextEventId: 'n5-sub-promote'
        },
        {
          id: 'n5-c2',
          text: '苟住保饭碗 (现金-5k)',
          description: '主动降薪求留任，或者给领导送礼。虽然憋屈，但至少每个月有流水。',
          effects: [{ stat: 'cash', value: -5000 }, { stat: 'mind', value: -20 }, { stat: 'safeInvest', value: 2000 }], 
          disabled: isPerfLow,
          disabledReason: '绩效过低(被优化)',
          nextEventId: 'n5-sub-stay'
        },
        {
          id: 'n5-c3',
          text: '拿N+1走人 (现金+1.5w)',
          description: '此处不留爷。拿赔偿金走人，给自己放个假。但再就业的难度远超想象。',
          effects: [{ stat: 'cash', value: 15000 }, { stat: 'mind', value: 10 }, { stat: 'body', value: 5 }],
          flag: 'UNEMPLOYED',
          nextEventId: 'n5-sub-leave'
        },
        {
          id: 'n5-c4',
          text: '💀 黑市对赌/高利贷 (现金+50万)',
          description: '【绝境赌徒】签署黑市高利贷对赌协议，抵押全部身家。获得巨额启动资金，但背负年化300%的恐怖利息。赢了财富自由，输了断手断脚。',
          effects: [{ stat: 'cash', value: 500000 }, { stat: 'mind', value: -30 }, { stat: 'moral', value: -30 }], // Removed duplicate riskyInvest
          flag: 'NAKED_LOAN',
          riskLabel: 'High Risk',
          nextEventId: 'n5-sub-startup' // Re-use startup event, but flags will track the debt
        }
      ];
    },
    events: {
      'n5-sub-startup': {
        id: 'n5-sub-startup',
        context: (flags) => {
            if (flags.includes('NAKED_LOAN')) {
                return '【资金配置时刻】\n50万现金已到账。你的倒计时开始了。\n高利贷月息惊人（年化180%+），常规手段必死无疑。你必须决定这笔钱的去向。这是你唯一的弹药。';
            }
            return '你不再是打工人，你是“X总”。每天工作16个小时，为了融资喝到胃出血。看着产品雏形，你觉得一切都值得。';
        },
        choices: (flags) => {
             // OPTIMIZED CHOICE: Black Market Loan logic - Allocation Phase
             if (flags.includes('NAKED_LOAN')) {
                 return [
                    { 
                        id: 'n5-st-loan-invest', 
                        text: '全仓金融博弈 (转入激进账户)', 
                        description: '【唯一解？】实体回报太慢。你将45万转入高风险投资账户（股票/币圈），留5万生活。利用系统的“激进收益加成”试图跑赢利息。', 
                        effects: [{stat:'cash', value:-450000}, {stat:'riskyInvest', value: 450000}, {stat:'mind', value: -10}] 
                    },
                    { 
                        id: 'n5-st-loan-biz', 
                        text: '实业烧钱扩张 (转化估值)', 
                        description: '【高绩效路线】花10万买量/招聘（消耗），将30万转化为公司资产（激进投资）。虽然资产规模不如直接炒股，但能获得极高的业务绩效。', 
                        effects: [{stat:'cash', value:-400000}, {stat:'riskyInvest', value: 300000}, {stat:'performance', value: 50}, {stat: 'body', value: -20}] 
                    },
                    { 
                        id: 'n5-st-loan-save', 
                        text: '存死期/稳健理财 (转入稳健账户)', 
                        description: '【死亡陷阱】你害怕亏损，将45万存入稳健理财。提示：稳健收益(1.5%)远低于高利贷利息(15%)，这是慢性自杀。', 
                        effects: [{stat:'cash', value:-450000}, {stat:'safeInvest', value: 450000}, {stat:'mind', value: 5}] 
                    }
                 ];
             }
             return [
                { id: 'n5-st-a', text: 'All-in 精神', description: '你透支身体，但也获得了前所未有的掌控感。', effects: [{stat:'mind', value:10}, {stat:'body', value:-25}, {stat: 'performance', value: 20}] },
                { id: 'n5-st-b', text: '患得患失', description: '担心失败，开始想留后路，导致决策犹豫不决。', effects: [{stat:'mind', value:-20}, {stat:'safeInvest', value:-5000}] }
             ];
        }
      },
      'n5-sub-promote': {
        id: 'n5-sub-promote',
        context: () => '你来到了新公司，宽敞的工位，更高的薪水。但你发现这里的人际关系比上一家更复杂，你的“空降”身份让你成为了众矢之的。',
        choices: [
          { id: 'n5-pr-a', text: '强力破局', description: '用实力说话，快速建立威信。', effects: [{stat:'mind', value: -10}, {stat:'performance', value: 20}] },
          { id: 'n5-pr-b', text: '低调做人', description: '先观察局势，谁也不得罪。', effects: [{stat:'performance', value: 5}, {stat:'mind', value: 5}] }
        ]
      },
      'n5-sub-stay': {
        id: 'n5-sub-stay',
        context: () => '看着空荡荡的办公室，你成了幸存者。但走了的人的工作都堆到了你头上，工作量翻倍，工资打折。',
        choices: [
          { id: 'n5-sy-a', text: '一人顶三岗', description: '为了证明自己的价值，你拼命工作。位置稳了，但腰间盘突出了。', effects: [{stat:'safeInvest', value:5000}, {stat:'body', value:-25}, {stat: 'performance', value: 20}] },
          { id: 'n5-sy-b', text: '摸鱼考证', description: '用公司的资源干自己的事。随时准备跑路，对团队毫无贡献。', effects: [{stat:'moral', value:-20}, {stat:'mind', value:5}, {stat: 'performance', value: -10}] }
        ]
      },
      'n5-sub-leave': {
        id: 'n5-sub-leave',
        context: () => '拿着赔偿金，你去了大理/鹤岗躺平了一个月。回来后发现招聘软件上全是“已读不回”，HR开始嫌弃你的空窗期。',
        choices: [
          { id: 'n5-lv-a', text: '降薪求职 (现金+1000)', description: '为了社保不断缴，去了一家不如意的小公司。', effects: [{stat:'cash', value:1000}, {stat:'mind', value:-20}] },
          { id: 'n5-lv-b', text: '死磕大厂', description: '坚持不降薪，存款在燃烧，焦虑在蔓延。', effects: [{stat:'mind', value:-20}, {stat:'riskyInvest', value:-5000}] }
        ]
      }
    }
  },
  // ... (Subsequent Nodes 6-11 remain unchanged)
  // [Preserving the rest of the file content for Node 6 through 11 to avoid truncation]
  // --- NODE 6 ---
  {
    id: 'node-6',
    month: 14,
    title: '阶段三：危机 (后院起火)',
    news: '🏥 民生关注：医疗通胀率达到双位数，重症家庭因病致贫现象增加。',
    marketTrend: 'BEAR',
    context: (flags) => {
      const isEnt = flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN');
      const isUnemployed = flags.includes('UNEMPLOYED');
      const isBizBoom = flags.includes('BIZ_BOOM');
      const isBizStruggle = flags.includes('BIZ_STRUGGLE');
      
      let base = '凌晨三点，老家的电话像午夜凶铃一样响起。父亲突发脑溢血住院。';
      
      if (isEnt) {
          base += `\n\n此时你的公司正处于${isBizBoom ? '业务爆发期，投资人都在盯着数据' : (isBizStruggle ? '生死存亡之际，资金链随时会断裂' : '关键的爬坡期')}。离开意味着业务停摆，但不回去，你可能见不到父亲最后一面。`;
      } else if (isUnemployed) {
          base += '\n\n作为失业人员，你有大把的时间，但囊中羞涩。你担心高昂的ICU费用会瞬间击穿你仅存的积蓄，更害怕面对亲戚们关于工作的盘问。';
      } else {
          base += '\n\n你是独生子女，而公司项目正忙。现在摆在你面前的，是“尽孝”和“保住饭碗”的死局。';
      }
      return base;
    },
    onEnter: (flags, rng, stats) => {
        let text = '';
        const effects: ChoiceEffect[] = [];
        const newFlags: string[] = [];

        // RANDOM EVENT: Business Volatility Check (50/50)
        if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) {
            const isBoom = (rng * 100) % 10 > 5; 
            if (isBoom) {
                text += '【创业利好】你的项目踩中了风口，用户量激增！估值翻倍，投资人追加了投资意向。';
                effects.push({ stat: 'riskyInvest', value: Math.max(20000, stats.riskyInvest * 0.5) }); 
                newFlags.push('BIZ_BOOM');
            } else {
                text += '【创业危机】市场风向突变，竞品发起惨烈的价格战。公司现金流吃紧，库存积压。';
                effects.push({ stat: 'riskyInvest', value: Math.min(-10000, -stats.riskyInvest * 0.3) }); 
                newFlags.push('BIZ_STRUGGLE');
            }
            text += '\n';
        }

        if (stats.moral > 85) {
            text += '\n【善有善报】听说你家里出事，几个被你帮助过的老同学和社区志愿者主动联系你，帮你分担了部分陪护压力，并筹集了一笔慰问金。';
            effects.push({ stat: 'cash', value: 8000 });
            effects.push({ stat: 'mind', value: 15 });
        }
        
        return { text, effects, flags: newFlags };
    },
    choices: (flags, stats) => {
      const isLowMoral = stats.moral < 30;
      const isEstranged = stats.moral < 40; 
      const isEnt = flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN');
      const isUnemployed = flags.includes('UNEMPLOYED');
      
      const choices: Choice[] = [
        {
          id: 'n6-c1',
          text: isEnt ? '放下公司回老家 (现金-5k)' : (isUnemployed ? '回老家陪护 (现金-5k)' : '请假回老家陪护 (现金-5k)'),
          description: isEnt 
            ? '可能会错过投资人会议，导致融资失败。但爹妈只有一个。' 
            : (isUnemployed ? '虽然没有工作束缚，但往返路费和医院开销对没有收入的你来说是沉重的负担。' : '工作可以再找，爸妈只有一个。哪怕为此得罪老板，被扣绩效。'),
          effects: [{ stat: 'cash', value: -5000 }, { stat: 'moral', value: 25 }, { stat: 'mind', value: -10 }, { stat: 'performance', value: -20 }],
          disabled: isLowMoral || isEstranged,
          disabledReason: isEstranged ? '家庭关系疏远 (Moral < 30)' : '道德感淡漠 (Mind < 30)',
          nextEventId: 'n6-sub-home'
        },
        {
          id: 'n6-c2',
          text: '雇护工+汇款 (现金-4w)',
          description: '我回不去，但我能汇款。这是大城市打工人最无奈的“现代孝道”。掏空家底，但保住了工作/公司。',
          effects: [{ stat: 'cash', value: -40000 }, { stat: 'moral', value: 10 }, { stat: 'mind', value: -15 }], 
          nextEventId: 'n6-sub-money'
        },
        { 
          id: 'n6-c4',
          text: '远程问诊+临时护工 (现金-1.5w)',
          description: '运用你的信息搜集能力，安排了最优的远程医疗方案。理智且高效，但显得有些冷血。',
          effects: [{ stat: 'cash', value: -15000 }, { stat: 'mind', value: 5 }, { stat: 'moral', value: -5 }],
          disabled: !flags.includes('SKILL_UP') && !flags.includes('NETWORK_UP'), 
          disabledReason: '缺乏资源/人脉',
          nextEventId: 'n6-sub-tech'
        },
        {
          id: 'n6-c3',
          text: '无能为力',
          description: '我泥菩萨过江。除了在电话里哭，我什么都做不了。这会成为你一辈子的阴影。',
          effects: [{ stat: 'moral', value: -35 }, { stat: 'mind', value: -25 }],
          nextEventId: 'n6-sub-none'
        }
      ];
      return choices;
    },
    events: {
      'n6-sub-home': {
        id: 'n6-sub-home',
        context: (flags) => {
            if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) return '你在医院的折叠床上办公，信号时断时续。合伙人打来电话咆哮：“你现在不回来签字，投资人就要撤资了！这公司你还要不要了？”';
            if (flags.includes('UNEMPLOYED')) return '你在医院悉心照料，父亲病情稳定了。但亲戚们来探望时，总是问你在哪里高就。你只能尴尬地躲出去抽烟，看着缴费单上的数字发愁。';
            return '你在医院走廊的折叠床上睡了一周。父亲的病情稳定了，但老板的夺命连环Call把你拉回现实：“周一不回来，就别回来了。”';
        },
        choices: (flags) => {
            if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) {
                 return [
                    { id: 'n6-sub-home-stay', text: '死守医院', description: '公司没了可以再创，爹没了就真没了。你挂断了电话。', effects: [{stat:'moral', value:10}, {stat:'mind', value:-20}], flag: 'BIZ_FAIL', nextEventId: 'n6-sub-home-consequence' }, 
                    { id: 'n6-sub-home-leave', text: '连夜赶回救火', description: '看着父亲失望的眼神，你咬牙买了回程票。为了给父亲治病，你必须保住公司。', effects: [{stat:'body', value:-10}, {stat:'mind', value:-20}], nextEventId: 'n6-sub-home-back' }
                 ];
            }
            if (flags.includes('UNEMPLOYED')) {
                return [
                     { id: 'n6-sub-home-stay', text: '陪护到底 (现金-2000)', description: '反正没工作，就在医院多陪陪二老。虽然钱花得快，但心里踏实。', effects: [{stat:'cash', value:-2000}, {stat:'moral', value:10}], nextEventId: 'n6-sub-home-consequence' },
                ];
            }
            return [
                { id: 'n6-sub-home-stay', text: '再陪三天 (现金-2000)', description: '“家在这里，我能去哪？”你选择了亲情，赌公司不敢轻易辞退你。', effects: [{stat:'cash', value:-2000}, {stat:'moral', value:10}], nextEventId: 'n6-sub-home-consequence' },
                { id: 'n6-sub-home-leave', text: '连夜赶回搬砖', description: '看着父亲失望的眼神，你咬牙买了回程票。你是家里的顶梁柱，不能倒下。', effects: [{stat:'body', value:-10}, {stat:'mind', value:-20}], nextEventId: 'n6-sub-home-back' }
            ];
        }
      },
      'n6-sub-home-consequence': {
         id: 'n6-sub-home-consequence',
         context: (flags) => {
             if (flags.includes('BIZ_FAIL')) return '当你回到城市，办公室已经人去楼空。合伙人卷走了剩下的设备，留给你的只有一堆未结的账单。你的创业梦碎了，变回了负债累累的普通人。';
             if (flags.includes('UNEMPLOYED')) return '出院时，父母塞给你一张存折：“知道你在外面不容易，这钱你拿着应急。”你看着那双粗糙的手，眼泪止不住地流。';
             return '你赌赢了亲情，输了工作。回到公司发现工位被清空。但离家前母亲塞给你一张存折：“这是我和你爸攒的，别太累。”';
         },
         choices: (flags) => {
             if (flags.includes('BIZ_FAIL')) return [{ id: 'n6-hc-biz-fail', text: '接受失败', description: '一切归零。', effects: [{stat:'cash', value:-20000}, {stat:'mind', value:-30}] }];
             return [
                { id: 'n6-hc-1', text: '含泪收下 (现金+3w)', description: '生活所迫，你接受了父母的养老钱。这份钱沉甸甸的，压得你喘不过气。', effects: [{stat:'cash', value:30000}, {stat:'mind', value:-25}] },
                { id: 'n6-hc-2', text: '拒绝啃老', description: '把钱留给他们看病。你决定去打两份工来弥补失业的空窗。', effects: [{stat:'moral', value:10}, {stat:'body', value:-25}] }
             ];
         }
      },
      'n6-sub-home-back': {
         id: 'n6-sub-home-back',
         context: (flags) => {
             if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) return '你及时赶回公司，通宵搞定了投资人。资金链保住了，公司活下来了。但深夜独处时，父亲躺在病床上的样子总在眼前挥之不去。';
             return '你及时赶回了公司处理了危机。老板表扬了你的“职业精神”，发了2000元奖金。你看着红包，觉得无比讽刺。';
         },
         choices: [{ id: 'n6-hb-1', text: '继续前行 (现金+2000)', description: '生活还要继续。', effects: [{stat:'cash', value:2000}, {stat:'mind', value:-10}] }]
      },
      'n6-sub-money': {
        id: 'n6-sub-money',
        context: () => '转账成功的提示音响起，余额归零。你通过摄像头看着病床上的父亲，感觉自己像个提款机。为了填补这个窟窿，你必须更加拼命。',
        choices: [
          { id: 'n6-m-a', text: '开启996模式回血 (现金+5000)', description: '疯狂接单/加班。你的身体在燃烧，换来的是账户数字的回升。', effects: [{stat:'cash', value:5000}, {stat:'body', value:-25}] },
          { id: 'n6-m-b', text: '变卖闲置/借贷 (现金+2000)', description: '卖掉游戏机、包包，甚至借了微粒贷。生活质量一夜回到解放前。', effects: [{stat:'cash', value:2000}, {stat:'mind', value:-15}] }
        ]
      },
      'n6-sub-tech': {
        id: 'n6-sub-tech',
        context: () => '你用技术手段解决了物理距离的问题。虽然父母略有微词，但你也保住了工作和大部分存款。这或许是最优解，但不够温情。',
        choices: [{ id: 'n6-t-a', text: '理性胜利', description: '不管别人怎么说，活着才是硬道理。', effects: [{stat:'mind', value:5}] }]
      },
      'n6-sub-none': {
        id: 'n6-sub-none',
        context: () => '电话那头长久的沉默比责骂更刺耳。“没事，你在外面好好的就行。”这句话像耳光一样抽在你脸上。接下来的几天，你总是做噩梦。',
        choices: [
          { id: 'n6-n-a', text: '酒精麻痹', description: '喝醉了就不痛了。', effects: [{stat:'mind', value:-15}, {stat:'body', value:-10}] },
          { id: 'n6-n-b', text: '彻底黑化', description: '“人不为己，天诛地灭。”你切断了最后的软肋，心变得如钢铁般坚硬。', effects: [{stat:'moral', value:-25}, {stat:'mind', value:5}] }
        ]
      }
    }
  },
  // --- NODE 7 (UPDATED FOR FIX) ---
  {
    id: 'node-7',
    month: 16,
    title: '阶段三：决断 (锚点)',
    news: '🏠 楼市速递：核心地段房价依然坚挺，但远郊区挂牌量激增。',
    marketTrend: 'FLAT',
    context: (flags, stats) => {
      const moralHigh = stats.moral >= 30;
      let text = `第16个月。房东通知卖房，限两周搬走。这是第三次被迫搬家了。\n\n`;
      
      if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) {
          text += `创业期住办公室虽省钱，但缺乏隐私与热水。你渴望一个属于自己的堡垒。`;
      } else if (flags.includes('UNEMPLOYED')) {
          text += `失业的你面对上涨的房租感到窒息。每次搬家都是对积蓄的洗劫。\n(若已离城，需回城退租)`;
      } else {
          text += `此时家里来电。`;
          if (moralHigh) {
              text += `父母愿出资80%付首付：“有个家就不用漂了。”`;
          } else {
              text += `家里无力支持。看着余额，买房（首付10万）简直天方夜谭。`;
          }
      }
      
      text += `\n\n是背债扎根，还是继续漂泊？`;
      return text;
    },
    choices: (flags, stats) => {
      const moralHigh = stats.moral >= 30;
      const canAffordWithHelp = stats.cash >= 20000;
      const canAffordAlone = stats.cash >= 100000;
      const isBizFail = flags.includes('BIZ_FAIL');
      const isEnt = flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN');
      const isUnemployed = flags.includes('UNEMPLOYED');
      const isIsolated = flags.includes('SOCIAL_ISOLATION');

      return [
        {
          id: 'n7-buy-help',
          text: '接受资助买房 (现金-2万)',
          description: '掏空六个钱包上车。背负30年房贷，但有了安身之所。', 
          effects: [{ stat: 'cash', value: -20000 }, { stat: 'mind', value: 20 }, { stat: 'moral', value: -10 }], 
          flag: 'OWN_HOUSE',
          disabled: !moralHigh || !canAffordWithHelp || isBizFail || isUnemployed || isIsolated, 
          disabledReason: isBizFail ? '负债中' : (isUnemployed ? '无收入证明' : (isIsolated ? '众叛亲离 (SOCIAL_ISOLATION)' : (!moralHigh ? '家庭关系一般' : '余额<2万'))), 
          nextEventId: 'n7-sub-bought'
        },
        {
          id: 'n7-buy-alone',
          text: '靠自己硬买 (变现资产)',
          description: '【清仓】变现所有投资付首付。孤注一掷，只为在这个城市扎根。', 
          effects: [
              { stat: 'cash', value: -100000 }, 
              { stat: 'riskyInvest', value: -stats.riskyInvest }, 
              { stat: 'safeInvest', value: -stats.safeInvest }, 
              { stat: 'mind', value: 25 }
          ],
          flag: 'OWN_HOUSE',
          disabled: !canAffordAlone || isBizFail,
          disabledReason: isBizFail ? '信用破产' : '资金不足10万', 
          nextEventId: 'n7-sub-bought'
        },
        {
          id: 'n7-rent',
          text: '放弃买房 (继续租房)', 
          description: '买不起或不愿当房奴。虽然漂泊，但保有自由和现金流。', 
          effects: [{ stat: 'cash', value: -4000 }, { stat: 'mind', value: -15 }],
          nextEventId: 'n7-sub-rent'
        }
      ];
    },
    events: {
      'n7-sub-bought': {
        id: 'n7-sub-bought',
        context: () => '拿到红本本的那一刻，你在这座城市终于有了合法的坐标。虽然背上了30年的债务，但晚上睡觉终于踏实了。朋友们来温居，眼神里满是羡慕。',
        choices: [
          { id: 'n7-b-a', text: '痛并快乐着', description: '这不仅仅是房子，这是尊严。', effects: [{stat:'mind', value:5}] }
        ]
      },
      'n7-sub-rent': {
        id: 'n7-sub-rent',
        context: () => '你搬到了更偏远的地方。省下的钱可以去理财或者消费，但你知道，这些钱永远追不上房价的涨幅。你是一个自由的游牧民，也是一个无根的过客。',
        choices: [
          { id: 'n7-r-a', text: '投资自己 (现金-1000)', description: '把钱花在学习上，期待未来升值。', effects: [{stat:'mind', value:5}, {stat:'cash', value:-1000}] },
          { id: 'n7-r-b', text: '及时行乐 (现金-500)', description: '不如买点好吃的，犒劳一下自己。', effects: [{stat:'mind', value:5}, {stat:'cash', value:-500}] }
        ]
      }
    }
  },
  // --- NODE 8 ---
  {
    id: 'node-8',
    month: 18,
    title: '阶段三：喘息 (清明/五一)',
    news: '📉 宏观数据：CPI 温和上涨，但娱乐消费支出大幅萎缩。',
    marketTrend: 'BEAR',
    context: (flags) => {
        if ((flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) && !flags.includes('BIZ_FAIL')) {
            return `第18个月。虽然法定假期有4天，但作为创业者，你的词典里没有假期。\n\n员工们都放假了，办公室空荡荡的。这是难得的深度思考时间，也是最焦虑的时刻。你是选择继续卷业务，还是逼自己休息一下？`;
        }
        if (flags.includes('UNEMPLOYED')) {
            return `第18个月。对于失业的你来说，每天都是假期，也每天都不是。朋友圈里大家都在晒旅游，这种热闹让你倍感孤独。\n\n4天小长假，招聘软件也停更了。你是选择彻底躺平修复心态，还是利用这个机会去混混社交圈？`;
        }
        return `第18个月。经历了家庭变故和居住动荡，你身心俱疲。\n\n此时，迎来了4天的小长假。这是暴风雨前的宁静，也是你调整状态迎接终局的最后机会。\n\n你是选择彻底躺平修复身体，还是抓紧时间搞钱/积累人脉？`;
    },
    onEnter: (flags, rng, stats) => {
        let text = '';
        const effects: ChoiceEffect[] = [];
        const newFlags: string[] = [];

        // RANDOM EVENT: Business Volatility Check Part 2
        if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) {
            const isLucky = (rng * 100) % 10 > 4; 
            const isAlreadyBooming = flags.includes('BIZ_BOOM');
            
            if (isLucky) {
                text += isAlreadyBooming 
                    ? '【乘胜追击】公司业绩持续走高，有机构抛出了并购橄榄枝。'
                    : '【触底反弹】经过调整，公司业务终于有了起色，现金流转正。';
                effects.push({ stat: 'riskyInvest', value: Math.max(30000, stats.riskyInvest * 0.4) });
            } else {
                text += '【持续承压】市场大环境依然低迷，大客户回款周期延长。焦虑让你开始脱发。';
                effects.push({ stat: 'riskyInvest', value: Math.min(-15000, -stats.riskyInvest * 0.2) });
                effects.push({ stat: 'mind', value: -10 });
            }
            text += '\n\n';
        }

        // PERFORMANCE REWARD (Standard)
        if (stats.performance > 90 && !flags.includes('UNEMPLOYED') && !flags.includes('ENTREPRENEUR')) {
            text += '【人才挽留】由于你持续的高绩效表现，公司担心你跳槽，特批了一笔年终人才保留奖金。';
            effects.push({ stat: 'cash', value: 10000 }); 
            effects.push({ stat: 'mind', value: 10 });
        }
        
        return { text, effects, flags: newFlags };
    },
    simulation: {
      type: 'ALLOCATION',
      totalPoints: 4, 
      categories: [
        { id: 'rest', label: '深度睡眠', desc: '关机断网，彻底修复。' },
        { id: 'social', label: '向上社交', desc: '混迹高端局/同学会。' },
        { id: 'hustle', label: '极限接单', desc: '节假日三倍薪资。' }
      ]
    }
  },
  // --- NODE 9 ---
  {
    id: 'node-9',
    month: 20,
    title: '阶段四：终局 (成家立业)',
    news: '💔 婚恋大数据：一线城市初婚年龄推迟至32岁，彩礼/婚房纠纷案件数量上升。',
    marketTrend: 'FLAT',
    context: (flags, stats) => {
      const isDebt = stats.cash < -20000 || flags.includes('DEBT_TRAP');
      const isLowMoral = stats.moral < 20;

      if (isDebt && !isLowMoral) {
          return `【现实的耳光】第20个月。女友本想和你商量结婚，但无意中看到了你的催收短信和负债账单。\n\n她沉默了很久，最后红着眼眶说：“我能陪你吃苦，但我不能拿我和父母的未来去填你的无底洞。”\n\n现实不是偶像剧，负债累累的你，连谈婚论嫁的入场券都被没收了。`;
      }

      if (flags.includes('LOVE_COMPLEX')) {
        return `【修罗场降临】你一直以为自己是时间管理大师，但纸终究包不住火。就在今晚，命运的审判降临了。\n\n白月光突然向你下了最后通牒：“要么结婚，要么彻底消失。”并暗示TA手里有能毁掉你名声的证据。\n而女友似乎察觉到了什么，今晚做了一桌你爱吃的菜，眼神里满是试探和不安。\n\n你必须在今晚做出选择。这不是关于爱情，而是关于止损。`;
      }
      
      if (flags.includes('SINGLE_DOG')) {
        return `【最后通牒】你独自回到了老家，迎接你的是一场精心策划的“围剿”。父母以断绝关系相逼，安排了一场高端相亲。\n\n对方是本地小富二代，家里有厂有矿。对方直言不讳：“我看中的是你的学历和基因，婚后你不用工作，但也别管我在外面玩。”\n\n父母下了死命令：“这婚你结也得结，不结也得结！对方提供80万家庭启动资金，这是你奋斗二十年都赚不到的钱。”`;
      }

      let baseContext = `第20个月。如果说之前的挑战是单兵作战，现在你迎来了多人副本。女友提出了结婚。\n\n`;
      if (flags.includes('ENTREPRENEUR') || flags.includes('NAKED_LOAN')) {
          baseContext += `岳父岳母对你的创业状态表示担忧，认为不够稳定。他们希望你能拿出一笔“彩礼”来证明抗风险能力。`;
      } else if (flags.includes('UNEMPLOYED')) {
          baseContext += `因为你目前失业，岳父岳母坚决反对。女友虽然在争取，但现实的压力让她也开始动摇。你必须证明你有能力撑起这个家。`;
      } else {
          baseContext += `但这不仅是领证，更是两个家庭资产的合并。`;
      }
      
      baseContext += `\n\n对方家庭提出了要求：${flags.includes('OWN_HOUSE') ? '房产证加名，并支付20万彩礼。' : '必须买房（或支付高额彩礼），否则免谈。'}`;
      return baseContext;
    },
    choices: (flags, stats) => {
       const hasHouse = flags.includes('OWN_HOUSE');
       const hasMoney = stats.cash >= 100000;
       const highMoral = stats.moral >= 40;
       
       const isDebt = stats.cash < -20000 || flags.includes('DEBT_TRAP');
       const isLowMoral = stats.moral < 20;

       if (isDebt && !isLowMoral) {
           return [
               { id: 'n9-debt-breakup', text: '接受分手', description: '虽然心痛，但你无法反驳。放手是对她最后的温柔。', effects: [{stat:'mind', value: -20}, {stat:'moral', value: 5}], flag: 'SINGLE_DOG', nextEventId: 'n9-sub-fight' }, 
               { id: 'n9-debt-beg', text: '苦苦哀求', description: '你抛弃尊严乞求机会，但换来的只是对方父母的驱逐。', effects: [{stat:'mind', value: -30}, {stat:'performance', value: -10}], flag: 'SINGLE_DOG', nextEventId: 'n9-sub-fight' }
           ];
       }

       if (flags.includes('LOVE_COMPLEX')) {
           return [
               { id: 'n9-complex-moon', text: '选择白月光 (现金-15万)', description: '你选择了激情和虚荣。代价是惨重的：支付现任的分手费 + 筹备一场满足白月光虚荣心的豪华婚礼。这是一场豪赌。(道德崩塌，财富血亏)', effects: [{stat:'cash', value: -150000}, {stat:'moral', value: -30}, {stat:'mind', value: -10}], flag: 'MARRIED_MOON', disabled: stats.cash < 50000 && !hasHouse, disabledReason: '资产不足以支付代价', nextEventId: 'n9-sub-complex-moon' },
               { id: 'n9-complex-stable', text: '回归现任 (现金-5万)', description: '你跪地求饶，发誓断绝关系。女友原谅了你，但要求掌握财政大权，并索要5万元“保证金”。你保住了家，但失去了尊严。', effects: [{stat:'mind', value: -15}, {stat:'moral', value: -10}, {stat:'cash', value: -50000}], nextEventId: 'n9-sub-complex-stable' },
               { id: 'n9-complex-fail', text: '全盘皆输', description: '你犹豫了。结果白月光把证据发给了女友。两人都离开了你，你在朋友圈出名了，成了孤家寡人。(身败名裂)', effects: [{stat:'mind', value: -30}, {stat:'moral', value: -20}], nextEventId: 'n9-sub-complex-fail' }
           ];
       }

       if (flags.includes('SINGLE_DOG')) {
           return [
               { id: 'n9-single-marry', text: '接受交易 (现金+8万)', description: '为了阶级跃升，你出卖了下半生的自由。对方家庭给了你丰厚的启动金，但你看着镜子里的自己，感觉像个被收购的商品。(财富暴涨，精神枯萎)', effects: [{stat:'cash', value: 80000}, {stat:'mind', value: -30}, {stat:'moral', value: -5}], flag: 'MARRIED_DEAL', nextEventId: 'n9-sub-single-marry' },
               { id: 'n9-single-reject', text: '掀翻桌子 (现金-5000)', description: '“我不卖！”你当众拒绝了婚事，气晕了父母。你守住了尊严，但彻底断了家庭的经济后路。(精神自由，众叛亲离)', effects: [{stat:'mind', value: 20}, {stat:'moral', value: -15}, {stat:'cash', value: -5000}], nextEventId: 'n9-sub-single-reject' },
               { id: 'n9-single-delay', text: '战术拖延', description: '你谎称公司有急事逃回了城市。虽然暂时躲过一劫，但你知道，只要你还要脸，这把刀迟早会落下。', effects: [{stat:'mind', value: -10}], nextEventId: 'n9-sub-single-delay' }
           ];
       }
       
       return [
           { id: 'n9-c1', text: '同意谈彩礼 (开启谈判博弈)', description: '为了结婚，你决定坐下来和岳父岳母谈谈。这是一场关于爱情和面包的终极博弈。', effects: [], nextEventId: 'n9-sub-caili-sim' },
           { id: 'n9-c2', text: '据理力争/拒绝扶贫', description: '“婚姻不是买卖。”你拒绝了高额要求。感情面临破裂，但你守住了财产防线。', effects: [{stat:'mind', value: -20}, {stat:'moral', value: -5}], nextEventId: 'n9-sub-fight' },
           { id: 'n9-c3', text: '回老家找个“老实人” (现金+5万)', description: '累了。接受父母的安排，回老家相亲结婚。虽然没有爱情，但对方家庭提供了丰厚的陪嫁。', effects: [{stat:'mind', value: -30}, {stat:'cash', value: 50000}], flag: 'MARRIED_HOME', nextEventId: 'n9-sub-home' }
       ];
    },
    events: {
      'n9-sub-caili-sim': {
          id: 'n9-sub-caili-sim',
          context: () => '谈判桌上气氛凝重。岳父岳母列出了长长的清单。父母表示可以支持你，但他们的能力也有限。\n\n请拖动滑块决定彩礼金额 (单位: 万)。',
          choices: [] 
      },
      'n9-sub-caili-result-low': {
          id: 'n9-sub-caili-result-low',
          context: () => '【谈判崩盘】岳父岳母觉得你没有诚意，认为你在羞辱他们。女友在父母的压力下提出了分手。你省下了钱，但心里空了一块。',
          choices: [{ id: 'n9-caili-low-confirm', text: '接受现实', description: '虽然很痛，但至少没破产。', effects: [] }]
      },
      'n9-sub-caili-result-mid-house': { 
          id: 'n9-sub-caili-result-mid-house',
          context: () => '【雪上加霜】因为买了房，父母已经掏空了积蓄。这笔彩礼钱你只能自己硬扛。看着父母愧疚的眼神，和自己缩水的存款，你感到无比沉重。',
          choices: [{ id: 'n9-caili-mid-h-confirm', text: '独自承担', description: '这是成长的代价。', effects: [] }]
      },
      'n9-sub-caili-result-mid-norm': { 
          id: 'n9-sub-caili-result-mid-norm',
          context: () => '【举全家之力】父母拿出了最后的养老钱帮你凑齐了份额。婚礼很体面，但你看着父母斑白的鬓角，知道这都是他们的血汗。',
          choices: [{ id: 'n9-caili-mid-n-confirm', text: '心怀愧疚', description: '暗暗发誓一定要出人头地。', effects: [] }]
      },
      'n9-sub-caili-result-high': {
          id: 'n9-sub-caili-result-high',
          context: () => '【意外惊喜】你的豪爽打动了岳父岳母。他们觉得你靠谱且重视这段感情，不仅全额返还了彩礼，还额外赠予了一辆车。你赢了面子，也赢了里子。',
          choices: [{ id: 'n9-caili-high-confirm', text: '人生赢家', description: '这一把赌对了。', effects: [] }]
      },
      'n9-sub-complex-moon': {
          id: 'n9-sub-complex-moon',
          context: () => '婚礼如期举行，奢华程度令人咋舌。朋友圈里全是艳羡的点赞，你成了所有人眼中的“人生赢家”。\n\n但在聚光灯熄灭后的深夜，你看着信用卡长长的账单，和枕边那个依然在挑剔婚礼细节的白月光，突然意识到：你买回来的不是爱情，是一个无底洞。',
          choices: [{ id: 'n9-cm-a', text: '冷暖自知', description: '这就是我选择的“上流”生活。', effects: [{stat:'mind', value:-10}] }]
      },
      'n9-sub-complex-stable': {
          id: 'n9-sub-complex-stable',
          context: () => '日子恢复了平静，但裂痕永远无法弥合。你成了家里的“二等公民”，每当你晚归半小时，女友都会用查岗的语气盘问你。你在自己买的房子里，活得像个寄人篱下的租客。',
          choices: [{ id: 'n9-cs-a', text: '戴罪立功', description: '为了家，忍了。', effects: [{stat:'mind', value:-15}] }]
      },
      'n9-sub-complex-fail': {
          id: 'n9-sub-complex-fail',
          context: () => '你独自坐在空荡荡的房间里，翻看着以前的聊天记录。贪心的人终究一无所有。你在公司成了笑话，在朋友圈成了渣男。你自由了，也彻底烂了。',
          choices: [{ id: 'n9-cf-a', text: '重新做人', description: '孤独是最好的惩罚。', effects: [{stat:'mind', value:-10}] }]
      },
      'n9-sub-single-marry': {
          id: 'n9-sub-single-marry',
          context: () => '你领证了。对方家庭给了你一大笔启动资金，你的生活质量一夜之间上了台阶。你开着豪车，住着豪宅，但对方在外面彩旗飘飘，对你视而不见。\n\n你试图抗议，对方冷冷地说：“收了钱就闭嘴，摆正你的位置。”',
          choices: [{ id: 'n9-sm-a', text: '笼中鸟的觉悟', description: '麻木地享受着物质的丰盈，灵魂慢慢枯萎。', effects: [{stat:'mind', value:-10}] }]
      },
      'n9-sub-single-reject': {
          id: 'n9-sub-single-reject',
          context: () => '拉黑了父母的微信，你独自坐上了回城的列车。车窗外是飞逝的麦田。你感觉自己断了根，像个孤魂野鬼。\n\n但当你打开窗，迎面吹来的冷风让你打了个寒颤，也让你前所未有地清醒：这是你的人生，谁也别想买走。',
          choices: [{ id: 'n9-sr-a', text: '绝对自由', description: '虽然冷，但是自由的。', effects: [{stat:'mind', value:5}] }]
      },
      'n9-sub-single-delay': {
          id: 'n9-sub-single-delay',
          context: () => '回到出租屋，你长舒一口气。但你知道这只是暂时的。明年春节，同样的戏码还会上演。这种悬在头顶的剑，让你无法安睡。你开始害怕过节，害怕电话铃声。',
          choices: [{ id: 'n9-sd-a', text: '鸵鸟心态', description: '能躲一天是一天。', effects: [{stat:'mind', value:-5}] }]
      },
      'n9-sub-married': {
        id: 'n9-sub-married',
        context: () => '婚礼很隆重，你笑得很僵硬。看着台下的宾客，你感觉自己完成了一项KPI。晚上算账时，发现为了这一天，你们家倒退了十年。',
        choices: [
          { id: 'n9-ma-a', text: '这就是生活', description: '平平淡淡，才是真？', effects: [{stat:'mind', value:5}] }
        ]
      },
      'n9-sub-fight': {
        id: 'n9-sub-fight',
        context: () => '争吵，冷战，分手。你恢复了单身，保住了钱，但失去了一个可能陪你走下去的人。房间里安静得可怕。',
        choices: [
          { id: 'n9-fi-a', text: '麻痹自己 (现金+3000)', description: '把所有时间投入工作，不再相信感情。你变得富有了，也变得冷漠了。', effects: [{stat:'cash', value:3000}, {stat:'body', value:-15}, {stat:'performance', value: 10}] },
          // OPTIMIZED CHOICE: Replaced "Revenge Spending" with "Stoic Reconstruction"
          { id: 'n9-fi-b', text: '斯多葛哲学 (身心重铸)', description: '【断舍离】健身、读书、早睡。把失恋的能量转化为肌肉和多巴胺。最顶级的报复是过得比TA好。', effects: [{stat:'mind', value:15}, {stat:'body', value:15}, {stat:'cash', value:-500}] }
        ]
      },
      'n9-sub-home': {
        id: 'n9-sub-home',
        context: () => '老家的生活节奏很慢。伴侣很贤惠/踏实，日子过得去。但每当深夜刷到大城市的朋友圈，你总会问自己：“我不甘心吗？”',
        choices: [
          { id: 'n9-hm-a', text: '平平淡淡才是真', description: '接受平凡，也是一种勇气。', effects: [{stat:'mind', value:10}] }
        ]
      }
    }
  },
  // --- NODE 10 (Update: Criminal Path) ---
  {
    id: 'node-10',
    month: 22,
    title: '阶段四：决断 (梭哈)',
    news: '📉 全球市场：纳斯达克指数单日暴跌5%，币圈遭遇黑天鹅。',
    marketTrend: 'VOLATILE',
    context: (flags, stats) => {
      const isDebt = stats.cash < 0 || flags.includes('DEBT_TRAP');
      const isBizFail = flags.includes('BIZ_FAIL');
      const isHome = flags.includes('MARRIED_HOME');
      
      if (isDebt || isBizFail) {
        return '离这轮人生模拟结束只剩两个月。你身负巨债，催收的红漆泼在了你家门口。按部就班已经无法拯救你，你必须用剩下的半条命，去赌一个“翻身”的机会。';
      }
      if (isHome) {
          return '虽然已经回到了老家，过上了看似安稳的日子。但看到新闻里全球市场暴跌的消息，你看着手里积攒的一点积蓄，内心深处的赌性再次蠢蠢欲动。\n这是最后一次机会，是甘心平庸，还是最后疯一把？';
      }
      return '离这轮人生模拟结束只剩两个月。你看着账户里不尴不尬的余额，心中涌起一股不甘。\n\n留给你的时间不多了。是继续在这座城市死磕，还是用仅存的筹码换一种活法？';
    },
    choices: (flags, stats) => {
      const isPoor = stats.cash < 20000;
      const isDebt = stats.cash < 0 || flags.includes('DEBT_TRAP') || flags.includes('BIZ_FAIL');
      const isDebtTrap = flags.includes('DEBT_TRAP') && stats.cash < -5000; 
      const isDesperate = stats.cash < 5000 && stats.moral < 20;
      
      const totalAssets = stats.cash + stats.safeInvest + stats.riskyInvest;
      const canRun = totalAssets > 200000; // Requires 200k to attempt escape

      const normalChoices: Choice[] = [
        { id: 'n10-c1', text: 'All-in 高风险投资 (现金-1w)', description: '加杠杆，博单车变摩托。赢了财富自由，输了下海干活。', effects: [{ stat: 'riskyInvest', value: 0 }, { stat: 'cash', value: -10000 }], disabled: isPoor && !isDebt, disabledReason: '本金不足', nextEventId: 'n10-sub-gamble' },
        { id: 'n10-c2', text: '落袋为安 (变现)', description: '我不玩了。把所有资产换成现金，哪怕以后贬值，至少现在是我的。', effects: [{ stat: 'cash', value: 5000 }, { stat: 'mind', value: -10 }], disabled: isDebtTrap, disabledReason: '身负高利贷', nextEventId: 'n10-sub-safe' },
        { id: 'n10-c3', text: '投资自己大脑 (现金-2万)', description: '报班学习。这是唯一别人抢不走的资产，虽然短期看不见回报。', effects: [{ stat: 'cash', value: -20000 }, { stat: 'mind', value: 20 }, { stat: 'body', value: -5 }], disabled: isPoor || isDebtTrap, disabledReason: isDebtTrap ? '失信人员' : '学费不足', nextEventId: 'n10-sub-learn' },
        { id: 'n10-c4', text: '✈️ 移民/润 (Run)', description: '【高门槛】变卖国内所有资产，去一个没人认识你的地方重新开始。需要至少20万启动资金。', effects: [{ stat: 'cash', value: stats.safeInvest + stats.riskyInvest }, { stat: 'safeInvest', value: -stats.safeInvest }, { stat: 'riskyInvest', value: -stats.riskyInvest }, { stat: 'moral', value: 5 }], disabled: !canRun || isDebt, disabledReason: isDebt ? '被限制出境' : '资产不足20万', flag: 'WENT_ABROAD', nextEventId: 'n10-sub-safe' }
      ];

      // CRIME PATH
      if (isDesperate) {
          normalChoices.push({
              id: 'n10-c-crime',
              text: '😈 成为暗网“车手”',
              description: '【犯罪歧途】既然正道走不通，那就走黑道。帮地下钱庄洗钱，报酬极其丰厚，但如果被抓就是万劫不复。',
              effects: [{ stat: 'cash', value: 200000 }, { stat: 'moral', value: -100 }, { stat: 'mind', value: -30 }],
              flag: 'CRIMINAL',
              riskLabel: 'High Risk',
              nextEventId: 'n10-sub-crime'
          });
      }

      if (isDebt) {
          normalChoices.unshift({
              id: 'n10-debt-gamble',
              text: '💀 卖命梭哈',
              description: '【绝境操作】参与地下高危试药或签署黑市协议。用健康换取最后一次上桌的筹码。这是你唯一翻身的机会。',
              effects: [{ stat: 'body', value: -40 }, { stat: 'mind', value: -20 }, { stat: 'riskyInvest', value: 200000 }], 
              riskLabel: 'Rescue',
              nextEventId: 'n10-sub-gamble-debt'
          });
      }
      return normalChoices;
    },
    events: {
      'n10-sub-gamble': {
        id: 'n10-sub-gamble',
        context: () => '你盯着屏幕，眼球充满了血丝。市场在疯狂波动，你的肾上腺素飙升。这一刻，你觉得自己是神，也是鬼。',
        choices: [
          // OPTIMIZED CHOICE: More nuance than just Win/Die
          { id: 'n10-g-a', text: '全仓百倍合约 (High Risk)', description: '不成功便成仁。波动1%就是天堂或地狱。', effects: [{stat:'cash', value:100000}] }, 
          { id: 'n10-g-b', text: '波段现货 (Mid Risk)', description: '相信自己的判断，稳扎稳打，试图从波动中吃肉。', effects: [{stat:'cash', value: 20000}, {stat:'mind', value: -10}] }
        ]
      },
      'n10-sub-gamble-debt': {
        id: 'n10-sub-gamble-debt',
        context: () => '你签下了那份协议，身体的剧痛让你几乎晕厥。但你拿着换来的筹码，颤抖着全部押了注。如果输了，这里就是你的终点。',
        choices: [{ id: 'n10-gd-a', text: '听天由命', description: '命运的骰子已经掷出。', effects: [] }]
      },
      'n10-sub-safe': {
        id: 'n10-sub-safe',
        context: (flags) => {
            if (flags.includes('WENT_ABROAD')) {
                return '你联系了中介，变卖了所有家当，换成了外汇。看着窗外熟悉的街道，你知道这是最后一眼了。前路未卜，但你已没有退路。';
            }
            return '看着现金堆在账户里，你感到一种从未有过的平静。你退出了游戏，虽然没有赢大钱，但你也没有输掉底裤。';
        },
        choices: [
          { id: 'n10-s-a', text: '接受命运', description: '静待最终审判。', effects: [{stat:'mind', value:10}] }
        ]
      },
      'n10-sub-learn': {
        id: 'n10-sub-learn',
        context: () => '你坐在教室里，周围是比你年轻十岁的面孔。知识进入了脑子，但焦虑并没有完全消失。你期待长期的回报，但未来谁知道呢？',
        choices: [
          // OPTIMIZED CHOICE: Specific learning paths
          { id: 'n10-l-a', text: '苦钻硬技能 (AI/Code)', description: '掌握核心生产力，哪怕做个高级螺丝钉。', effects: [{stat:'mind', value:10}, {stat:'performance', value: 20}] },
          { id: 'n10-l-b', text: '混圈子 (MBA/社群)', description: '试图通过社交来置换资源，认识大佬。', effects: [{stat:'mind', value:-5}, {stat:'moral', value: -5}, {stat: 'performance', value: 5}], flag: 'NETWORK_UP' }
        ]
      },
      'n10-sub-crime': {
        id: 'n10-sub-crime',
        context: () => '你拿到了一箱现金，手指在颤抖。你删除了所有的聊天记录，扔掉了SIM卡。你富有了，但每当警笛声响起，你的心脏都会骤停一秒。',
        choices: [
          // OPTIMIZED CHOICE: Crime strategy
          { id: 'n10-cr-a', text: '亡命天涯 (Keep All)', description: '带着所有钱跑路，每天活在恐惧中。', effects: [{stat:'mind', value:-40}] },
          { id: 'n10-cr-b', text: '洗白上岸 (Lose 50%)', description: '花一半的钱买通关系/洗白身份。虽然钱少了，但睡得着。', effects: [{stat:'cash', value: -100000}, {stat:'mind', value: 10}] }
        ]
      }
    }
  },
  // --- NODE 11 ---
  {
    id: 'node-11',
    month: 24,
    title: '最终章：审判日',
    context: () => `第24个月。闹钟响了，梦醒了。\n\n两年时间，这座城市见证了你的挣扎、妥协与成长。你在这里留下了汗水、泪水，甚至血水。现在，系统正在生成你的人生判决书。你是留下来的人，还是离开的人，或者是...消失的人？`,
    choices: [
      { id: 'n11-end', text: '直面命运', description: '查看最终结局。', effects: [] }
    ]
  }
];
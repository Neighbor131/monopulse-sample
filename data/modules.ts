import type { LucideIcon } from 'lucide-react';
import {
  Ticket, CalendarClock, Crown, ShieldCheck, Coins, Percent, Layers,
  Flag, Gauge, Hash, Zap, Sparkles, Trophy,
  Wallet, Target, ListChecks, BadgeCheck, Repeat, Timer,
} from 'lucide-react';
import type { CampaignTypeId } from './campaigns';

// step ids mirror validation.StepId; kept local to avoid an import cycle
export type ModuleStep = 'setup' | 'audience' | 'logic' | 'rewards' | 'budget' | 'review';

export type ModuleFieldType =
  | 'text' | 'number' | 'select' | 'segmented' | 'toggle'
  | 'tiers' | 'matrix' | 'hash' | 'info';

export interface TierColumn {
  key: string;
  label: string;
  type?: 'text' | 'number';
  prefix?: string;
  suffix?: string;
}

export interface ModuleField {
  key: string;
  label: string;
  type: ModuleFieldType;
  hint?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  options?: string[];
  default?: string | number | boolean;
  // tiers
  columns?: TierColumn[];
  defaultRows?: Record<string, string>[];
  addLabel?: string;
  // matrix
  rows?: string[];
  cols?: string[];
  cellSuffix?: string;
  // info / hash body
  body?: string;
  tone?: 'info' | 'warning' | 'success';
  // layout
  full?: boolean;
  // conditional display
  showIf?: { key: string; equals: string | boolean };
  // subtype gating — field shows only when the draft's subtype is in this list
  subtypes?: string[];
}

export interface ModuleSection {
  id: string;
  step: ModuleStep;
  title: string;
  desc?: string;
  icon: LucideIcon;
  fields: ModuleField[];
  // subtype gating — section shows only when the draft's subtype is in this list
  subtypes?: string[];
}

// ─────────────────────────────────────────────────────────────
// MODULE SPECS — one entry per campaign type.
// Sections/fields tagged with `subtypes` render only for the chosen subtype.
// ─────────────────────────────────────────────────────────────
export const MODULE_SPECS: Record<CampaignTypeId, ModuleSection[]> = {
  // ── Missions & Quests ──
  mission: [
    {
      id: 'mission-structure', step: 'logic', title: 'Mission structure', icon: ListChecks,
      desc: 'Define what a player must complete to clear this mission.',
      fields: [
        { key: 'objectiveCount', label: 'Number of objectives', type: 'number', placeholder: 'e.g. 3', default: '3' },
        { key: 'completionMode', label: 'Completion requirement', type: 'segmented', options: ['All required', 'Any N of them'], default: 'All required' },
        { key: 'requiredCount', label: 'Objectives required', type: 'number', placeholder: 'e.g. 2', showIf: { key: 'completionMode', equals: 'Any N of them' } },
        { key: 'resetInfo', label: '', type: 'info', tone: 'info', body: 'Daily Quests reset every 24h; Weekly Quests reset each week.', subtypes: ['daily_quest', 'weekly_quest'], full: true },
        { key: 'unlockOrder', label: 'Objectives unlock in sequence', type: 'toggle', default: true, full: true, subtypes: ['linked_mission'], hint: 'each objective opens only after the previous clears' },
        { key: 'streakBonus', label: 'Streak bonus for consecutive days', type: 'toggle', default: false, full: true },
      ],
    },
    {
      id: 'mission-competitive', step: 'logic', title: 'Competitive scoring', icon: Trophy,
      desc: 'This mission is ranked against other players.', subtypes: ['race_mission'],
      fields: [
        { key: 'raceScoring', label: 'Rank by', type: 'select', options: ['Fastest to complete', 'Most objectives cleared', 'Highest turnover'], default: 'Fastest to complete' },
        { key: 'raceWinners', label: 'Winner slots', type: 'number', placeholder: 'e.g. 20' },
      ],
    },
    {
      id: 'mission-pacing', step: 'rewards', title: 'Reward pacing', icon: Target,
      fields: [
        { key: 'grantMode', label: 'Release reward', type: 'segmented', options: ['On full completion', 'Per objective'], default: 'On full completion' },
        { key: 'partialCredit', label: 'Carry partial progress across days', type: 'toggle', default: true },
      ],
    },
  ],

  // ── Races ──
  race: [
    {
      id: 'race-format', step: 'setup', title: 'Race format', icon: Flag,
      desc: 'How the race starts, who can join, and how it fires.',
      fields: [
        { key: 'trigger', label: 'Trigger mode', type: 'segmented', options: ['Auto-trigger', 'Manual trigger'], default: 'Auto-trigger' },
        { key: 'joinCutoff', label: 'Join cutoff', type: 'text', placeholder: 'e.g. 30 min after start', hint: 'after this, no new entrants' },
        { key: 'minParticipants', label: 'Minimum participants', type: 'number', placeholder: 'e.g. 25' },
        { key: 'sprintDuration', label: 'Race duration', type: 'text', placeholder: 'e.g. 3 hours', subtypes: ['sprint_race'], hint: 'short, high-intensity window' },
        { key: 'lapCount', label: 'Number of laps', type: 'number', placeholder: 'e.g. 4', subtypes: ['lap_race'] },
        { key: 'interimWinners', label: 'Award interim winners each lap', type: 'toggle', default: true, full: true, subtypes: ['lap_race'] },
        { key: 'marathonDays', label: 'Leaderboard duration (days)', type: 'number', placeholder: 'e.g. 7', subtypes: ['marathon_race'] },
      ],
    },
    {
      id: 'race-scoring', step: 'rewards', title: 'Scoring & finish line', icon: Gauge,
      desc: 'What earns points and how a winner is decided.',
      fields: [
        { key: 'multiplierInfo', label: '', type: 'info', tone: 'info', body: 'Multiplier Sprints rank by best single-bet win multiplier, not by volume — high stakes do not guarantee a lead.', subtypes: ['multiplier_sprint'], full: true },
        { key: 'scoring', label: 'Scoring system', type: 'select', options: ['Points per bet', 'Turnover', 'Net wins', 'Win multiplier product', 'Rounds played'], default: 'Turnover', subtypes: ['sprint_race', 'lap_race', 'marathon_race'] },
        { key: 'finishLine', label: 'Finish line (target score)', type: 'number', placeholder: 'e.g. 10000', hint: 'first to reach, or highest at end' },
        { key: 'winnerSlots', label: 'Winner slots', type: 'number', placeholder: 'e.g. 10' },
        { key: 'tieBreak', label: 'Tie-break', type: 'select', options: ['Earliest to reach', 'Highest turnover', 'Random draw'], default: 'Earliest to reach' },
      ],
    },
    {
      id: 'race-ladder', step: 'rewards', title: 'Prize ladder', icon: Trophy,
      desc: 'Reward per finishing position.',
      fields: [
        {
          key: 'prizeLadder', label: 'Positions', type: 'tiers', addLabel: 'Add position',
          columns: [
            { key: 'rank', label: 'Position', type: 'text' },
            { key: 'prize', label: 'Prize', type: 'text' },
          ],
          defaultRows: [
            { rank: '1st', prize: '€500 cash' },
            { rank: '2nd', prize: '€250 cash' },
            { rank: '3rd', prize: '100 free spins' },
          ],
        },
      ],
    },
  ],

  // ── Prize Drops ──
  prizedrop: [
    {
      id: 'drop-mechanic', step: 'setup', title: 'Drop mechanic', icon: Sparkles,
      desc: 'Configuration follows the drop trigger chosen for this campaign.',
      fields: [
        { key: 'nearDropTeaser', label: 'Show near-drop teaser to players', type: 'toggle', default: true, full: true, hint: 'builds anticipation as a drop approaches' },
        // Time-Slot
        { key: 'dropsPerDay', label: 'Drops per day', type: 'number', placeholder: 'e.g. 12', subtypes: ['time_slot'] },
        { key: 'slotWindow', label: 'Active slot window', type: 'text', placeholder: 'e.g. 18:00–23:00 UTC', subtypes: ['time_slot'] },
        { key: 'slotJitter', label: 'Randomize exact drop time within slot', type: 'toggle', default: true, full: true, subtypes: ['time_slot'], hint: 'stops players timing spins to a fixed second' },
        // Spin-Count
        { key: 'spinsBetween', label: 'Spins between drops', type: 'number', placeholder: 'e.g. 5000', subtypes: ['spin_count'] },
        { key: 'spinScope', label: 'Spin count scope', type: 'segmented', options: ['Network-wide', 'Per player'], default: 'Network-wide', subtypes: ['spin_count'] },
        // Sports Event Window
        { key: 'sportsEvent', label: 'Sports event / market', type: 'text', placeholder: 'e.g. UCL Final — full match', subtypes: ['sports_event_window'] },
        { key: 'eventWindow', label: 'Drop window', type: 'text', placeholder: 'e.g. kickoff → full-time', subtypes: ['sports_event_window'] },
        { key: 'dropsInWindow', label: 'Drops during window', type: 'number', placeholder: 'e.g. 20', subtypes: ['sports_event_window'] },
        // Sports Bet Count
        { key: 'betsBetween', label: 'Bets between drops', type: 'number', placeholder: 'e.g. 1000', subtypes: ['sports_bet_count'] },
        { key: 'betMarket', label: 'Qualifying market', type: 'select', options: ['Any market', 'Pre-match only', 'In-play only', 'Selected leagues'], default: 'Any market', subtypes: ['sports_bet_count'] },
        { key: 'betScope', label: 'Bet count scope', type: 'segmented', options: ['Network-wide', 'Per player'], default: 'Network-wide', subtypes: ['sports_bet_count'] },
      ],
    },
    {
      id: 'drop-tiers', step: 'rewards', title: 'Prize tiers', icon: Layers,
      desc: 'The prizes that can drop and how often each appears.',
      fields: [
        {
          key: 'prizeTiers', label: 'Prizes', type: 'tiers', addLabel: 'Add prize tier',
          columns: [
            { key: 'label', label: 'Prize', type: 'text' },
            { key: 'value', label: 'Value', type: 'number', prefix: '€' },
            { key: 'weight', label: 'Weight', type: 'number', suffix: '%' },
          ],
          defaultRows: [
            { label: 'Grand drop', value: '1000', weight: '2' },
            { label: 'Mid drop', value: '100', weight: '18' },
            { label: 'Mini drop', value: '10', weight: '80' },
          ],
        },
      ],
    },
    {
      id: 'drop-fraud', step: 'budget', title: 'Cooldown & fraud timing', icon: ShieldCheck,
      desc: 'Guards against players gaming drop timing.',
      fields: [
        { key: 'timingFlags', label: 'Flag suspicious drop-timing clustering', type: 'toggle', default: true, full: true, hint: 'detects bots timing spins to drop windows' },
        { key: 'playerCooldown', label: 'Per-player cooldown between wins (min)', type: 'number', placeholder: 'e.g. 60' },
        { key: 'maxDropsPerPlayer', label: 'Max drops won per player', type: 'number', placeholder: 'e.g. 3' },
        { key: 'minSpinsToQualify', label: 'Minimum activity to qualify', type: 'number', placeholder: 'e.g. 20', hint: 'spins or bets before eligible' },
      ],
    },
  ],

  // ── Raffles ──
  raffle: [
    {
      id: 'raffle-tickets', step: 'logic', title: 'Ticket earning', icon: Ticket,
      desc: 'How players accrue tickets. The qualifying events are defined in the rule builder above.',
      fields: [
        { key: 'ticketBaseline', label: 'Tickets per qualifying action', type: 'number', placeholder: 'e.g. 1', default: '1' },
        { key: 'ticketCap', label: 'Max tickets per player', type: 'number', placeholder: 'e.g. 100' },
      ],
    },
    {
      id: 'raffle-draw', step: 'rewards', title: 'Draw configuration', icon: CalendarClock,
      desc: 'When the draw runs and how winners are picked.',
      fields: [
        { key: 'standardInfo', label: '', type: 'info', tone: 'info', body: 'A standard raffle runs a single draw when the campaign ends.', subtypes: ['standard'], full: true },
        { key: 'cadence', label: 'Recurring cadence', type: 'segmented', options: ['Daily', 'Weekly'], default: 'Weekly', subtypes: ['recurring'] },
        { key: 'drawCount', label: 'Number of draws', type: 'number', placeholder: 'e.g. 4', subtypes: ['multi_draw'] },
        { key: 'drawInterval', label: 'Interval between draws', type: 'text', placeholder: 'e.g. every 6 hours', subtypes: ['multi_draw'] },
        { key: 'winnerCount', label: 'Winners per draw', type: 'number', placeholder: 'e.g. 5' },
        { key: 'ticketRetention', label: 'Tickets carry over between draws', type: 'toggle', default: false, full: true, subtypes: ['recurring', 'multi_draw'] },
        { key: 'rollover', label: 'Roll unclaimed prizes into next draw', type: 'toggle', default: false, full: true },
        // optional Golden Ticket weighting for non-golden subtypes
        { key: 'goldenTicket', label: 'Enable Golden Ticket weighting', type: 'toggle', default: false, full: true, hint: 'gives selected players weighted odds', subtypes: ['standard', 'recurring', 'multi_draw'] },
        { key: 'goldenMultiplier', label: 'Golden Ticket weight', type: 'number', suffix: '×', placeholder: 'e.g. 5', showIf: { key: 'goldenTicket', equals: true }, subtypes: ['standard', 'recurring', 'multi_draw'] },
        { key: 'goldenSegment', label: 'Golden Ticket segment', type: 'select', options: ['VIP', 'High rollers', 'Reactivated', 'Manual list'], showIf: { key: 'goldenTicket', equals: true }, subtypes: ['standard', 'recurring', 'multi_draw'] },
        {
          key: 'rafflePrizes', label: 'Prize pool', type: 'tiers', full: true, addLabel: 'Add prize',
          columns: [
            { key: 'prize', label: 'Prize', type: 'text' },
            { key: 'count', label: 'Qty', type: 'number' },
          ],
          defaultRows: [
            { prize: '€1,000 cash', count: '1' },
            { prize: '€100 bonus', count: '4' },
          ],
        },
      ],
    },
    {
      id: 'raffle-golden', step: 'rewards', title: 'Golden Ticket', icon: Crown,
      desc: 'A rare instant-win ticket sits alongside the pooled draw.', subtypes: ['golden_ticket'],
      fields: [
        { key: 'goldenOdds', label: 'Golden Ticket odds', type: 'text', placeholder: 'e.g. 1 in 50,000 tickets', hint: 'chance any earned ticket is golden' },
        { key: 'goldenPrize', label: 'Golden Ticket instant prize', type: 'text', placeholder: 'e.g. €2,500 cash' },
        { key: 'goldenMultiplier', label: 'Bonus weight in main draw', type: 'number', suffix: '×', placeholder: 'e.g. 5', hint: 'golden holders also get weighted pool odds' },
        { key: 'goldenSegment', label: 'Eligible segment', type: 'select', options: ['All players', 'VIP', 'High rollers', 'Reactivated'], default: 'All players' },
      ],
    },
    {
      id: 'raffle-fairness', step: 'budget', title: 'Commit / reveal audit', icon: Hash,
      desc: 'Provable fairness — the winning seed is committed before the draw and revealed after.',
      fields: [
        { key: 'drawCommitment', label: 'Draw commitment', type: 'hash', body: 'The random seed is hashed and committed at launch. After the draw, the seed is revealed so anyone can verify the winners were not altered.' },
        { key: 'publishProof', label: 'Publish verification proof to players', type: 'toggle', default: true, full: true },
      ],
    },
  ],

  // ── Jackpots ──
  jackpot: [
    {
      id: 'jackpot-seed-state', step: 'setup', title: 'Seed state', icon: Coins,
      fields: [
        { key: 'seedStateInfo', label: '', type: 'info', tone: 'warning', body: 'This campaign holds a PENDING_SEED status until the jackpot pool is funded with its seed amount. It cannot go live with an unfunded pool.' },
      ],
    },
    {
      id: 'jackpot-pool', step: 'rewards', title: 'Jackpot pool', icon: Coins,
      desc: 'The seed, how it grows, and the tiers that can drop.',
      fields: [
        { key: 'seedAmount', label: 'Seed amount', type: 'number', prefix: '€', placeholder: 'e.g. 10000', hint: 'initial pool value' },
        { key: 'contributionRate', label: 'Contribution rate', type: 'number', suffix: '% of bet', placeholder: 'e.g. 1.5' },
        {
          key: 'jackpotTiers', label: 'Jackpot tiers', type: 'tiers', full: true, addLabel: 'Add tier',
          columns: [
            { key: 'name', label: 'Tier', type: 'text' },
            { key: 'threshold', label: 'Trigger at', type: 'number', prefix: '€' },
            { key: 'share', label: 'Pool share', type: 'number', suffix: '%' },
          ],
          defaultRows: [
            { name: 'Mega', threshold: '50000', share: '70' },
            { name: 'Major', threshold: '5000', share: '20' },
            { name: 'Minor', threshold: '500', share: '10' },
          ],
        },
      ],
    },
    {
      id: 'jackpot-progressive', step: 'rewards', title: 'Progressive behaviour', icon: Repeat,
      desc: 'This pool grows continuously until it is won.', subtypes: ['progressive'],
      fields: [
        { key: 'progressiveInfo', label: '', type: 'info', tone: 'info', body: 'A progressive jackpot has no forced drop — it climbs across brands until a qualifying win triggers a tier. Set a soft cap in Budget & safety if you need a ceiling.' },
        { key: 'resetSeed', label: 'Reset to seed after a win', type: 'toggle', default: true, full: true },
      ],
    },
    {
      id: 'jackpot-mustdrop', step: 'rewards', title: 'Must-drop rule', icon: Timer,
      desc: 'A guaranteed drop condition for this jackpot.', subtypes: ['must_drop_value', 'must_drop_time'],
      fields: [
        { key: 'mustDropAmount', label: 'Must-drop ceiling', type: 'number', prefix: '€', placeholder: 'e.g. 75000', hint: 'guaranteed to drop before reaching this value', subtypes: ['must_drop_value'] },
        { key: 'mustDropDeadline', label: 'Must-drop deadline', type: 'text', placeholder: 'e.g. daily 23:59 UTC', hint: 'guaranteed to drop before this time', subtypes: ['must_drop_time'] },
        { key: 'mustDropAward', label: 'Award to', type: 'select', options: ['Last qualifying bet', 'Random active player', 'Highest contributor'], default: 'Random active player' },
      ],
    },
    {
      id: 'jackpot-community', step: 'rewards', title: 'Community split', icon: Percent,
      desc: 'Part of the win is shared across active players on drop.', subtypes: ['community_split'],
      fields: [
        { key: 'communityPct', label: 'Community share', type: 'number', suffix: '%', placeholder: 'e.g. 10' },
        { key: 'communityGroupSize', label: 'Players in the split', type: 'number', placeholder: 'e.g. 100', hint: 'most recently active qualifying players' },
        { key: 'communityInfo', label: '', type: 'info', tone: 'info', body: 'The winner takes the remaining share; the community pool is split evenly across the group.', full: true },
      ],
    },
  ],

  // ── Survival Mode ──
  survival: [
    {
      id: 'survival-days', step: 'setup', title: 'Day structure', icon: CalendarClock,
      desc: 'How the survival window is broken into days and elimination cycles.',
      fields: [
        { key: 'totalDays', label: 'Total days', type: 'number', placeholder: 'e.g. 7' },
        { key: 'eliminationWindow', label: 'Daily elimination window', type: 'text', placeholder: 'e.g. 20:00–20:15 UTC', hint: 'when non-qualifiers are cut' },
        { key: 'dailyTarget', label: 'Daily survival target', type: 'text', placeholder: 'e.g. €50 turnover' },
        { key: 'reEntry', label: 'Allow re-entry after elimination', type: 'toggle', default: false, full: true },
        { key: 'reEntryCost', label: 'Re-entry cost', type: 'number', prefix: '€', placeholder: 'e.g. 5', showIf: { key: 'reEntry', equals: true } },
        { key: 'gracePeriod', label: 'Grace period (hours)', type: 'number', placeholder: 'e.g. 2', hint: 'late-settling events still count' },
      ],
    },
    {
      id: 'survival-payout', step: 'rewards', title: 'Pool & payout', icon: Wallet,
      desc: 'How the prize pool is funded and split among survivors.',
      fields: [
        { key: 'guaranteedAmount', label: 'Guaranteed prize pool', type: 'number', prefix: '€', placeholder: 'e.g. 25000', hint: 'operator-funded, fixed value', subtypes: ['guaranteed_pool'] },
        { key: 'entryFee', label: 'Player entry fee', type: 'number', prefix: '€', placeholder: 'e.g. 10', subtypes: ['entry_fee_pool', 'hybrid_pool'] },
        { key: 'guaranteedFloor', label: 'Guaranteed floor', type: 'number', prefix: '€', placeholder: 'e.g. 5000', hint: 'minimum pool topped up by entries', subtypes: ['hybrid_pool'] },
        { key: 'rakePct', label: 'Operator rake on entries', type: 'number', suffix: '%', placeholder: 'e.g. 10', subtypes: ['entry_fee_pool', 'hybrid_pool'] },
        { key: 'payout', label: 'Survivor payout split', type: 'segmented', options: ['Winner-takes-all', 'Even split', 'Weighted by days survived'], default: 'Even split', full: true },
        { key: 'payoutInfo', label: '', type: 'info', tone: 'info', body: 'Survivors share the pool once the final elimination resolves. If everyone is eliminated on the last day, the pool rolls to the last survivors before that day.' },
      ],
    },
  ],

  // ── Velocity Milestones ──
  velocity: [
    {
      id: 'velocity-counter', step: 'logic', title: 'Counter metric', icon: Gauge,
      desc: 'What is counted and how often a milestone fires.',
      fields: [
        { key: 'counter', label: 'Counter metric', type: 'select', options: ['Bets placed', 'Turnover', 'Wins', 'Deposits', 'Rounds played'], default: 'Bets placed' },
        { key: 'eventTarget', label: 'Events per milestone', type: 'number', placeholder: 'e.g. 100', hint: 'hit N qualifying events to clear', subtypes: ['event_count'] },
        { key: 'volumeTarget', label: 'Volume per milestone', type: 'number', prefix: '€', placeholder: 'e.g. 500', hint: 'stake/wager volume to clear', subtypes: ['volume_target'] },
        { key: 'interval', label: 'Milestone interval', type: 'number', placeholder: 'e.g. 100', hint: 'reward every N counted', subtypes: ['mystery', 'frenzy_countdown'] },
        { key: 'maxMilestones', label: 'Max milestones per player', type: 'number', placeholder: 'e.g. 10' },
        { key: 'window', label: 'Countdown window', type: 'text', placeholder: 'e.g. 60 min', hint: 'time allowed to reach the target' },
      ],
    },
    {
      id: 'velocity-mystery', step: 'rewards', title: 'Mystery reward', icon: Sparkles,
      desc: 'A sealed reward revealed only on completion.', subtypes: ['mystery'],
      fields: [
        { key: 'mysteryHash', label: 'Mystery reward commitment', type: 'hash', full: true, body: 'The mystery reward pool is hashed and committed at launch, then revealed when a player reaches the milestone — proving the reward was not swapped after the fact.' },
        { key: 'revealTiming', label: 'Reveal reward', type: 'select', options: ['On reaching milestone', 'At campaign end'], default: 'On reaching milestone' },
        {
          key: 'mysteryPool', label: 'Possible rewards', type: 'tiers', full: true, addLabel: 'Add reward',
          columns: [
            { key: 'reward', label: 'Reward', type: 'text' },
            { key: 'weight', label: 'Weight', type: 'number', suffix: '%' },
          ],
          defaultRows: [
            { reward: '€500 cash', weight: '5' },
            { reward: '50 free spins', weight: '35' },
            { reward: '€10 bonus', weight: '60' },
          ],
        },
      ],
    },
    {
      id: 'velocity-frenzy', step: 'rewards', title: 'Frenzy countdown', icon: Zap,
      desc: 'Escalating rewards as the countdown shortens.', subtypes: ['frenzy_countdown'],
      fields: [
        { key: 'jitter', label: 'Frenzy countdown jitter (sec)', type: 'number', placeholder: 'e.g. 15', hint: 'randomizes the visible countdown to prevent gaming' },
        { key: 'escalation', label: 'Reward escalation', type: 'segmented', options: ['Linear', 'Exponential'], default: 'Exponential', full: true, hint: 'how fast the reward climbs as time runs down' },
        { key: 'frenzyPeak', label: 'Peak multiplier at zero', type: 'number', suffix: '×', placeholder: 'e.g. 3' },
      ],
    },
  ],

  // ── Achievements ──
  achievement: [
    {
      id: 'achievement-set', step: 'logic', title: 'Achievement set', icon: BadgeCheck,
      desc: 'The badges players can unlock in this collection.',
      fields: [
        {
          key: 'achievements', label: 'Achievements', type: 'tiers', full: true, addLabel: 'Add achievement',
          columns: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'criteria', label: 'Criteria', type: 'text' },
            { key: 'xp', label: 'XP', type: 'number' },
          ],
          defaultRows: [
            { name: 'First Steps', criteria: 'Place your first bet', xp: '50' },
            { name: 'Regular', criteria: '7-day login streak', xp: '200' },
          ],
        },
      ],
    },
    {
      id: 'achievement-rewards', step: 'rewards', title: 'Unlock behaviour', icon: Crown,
      fields: [
        { key: 'stackable', label: 'Achievements stack with other campaigns', type: 'toggle', default: true },
        { key: 'badgeDisplay', label: 'Show earned badges in player profile', type: 'toggle', default: true },
      ],
    },
  ],

  // ── Rakeback / Cashback ──
  rakeback: [
    {
      id: 'rakeback-calc', step: 'rewards', title: 'Calculation model', icon: Percent,
      desc: 'How rakeback is computed and at what rate per tier and product.',
      fields: [
        { key: 'model', label: 'Calculation model', type: 'segmented', options: ['Net loss', 'Turnover', 'Theoretical hold'], default: 'Net loss', full: true },
        {
          key: 'rateMatrix', label: 'Rate matrix', type: 'matrix', full: true, cellSuffix: '%',
          rows: ['Bronze', 'Silver', 'Gold', 'Platinum', 'VIP'],
          cols: ['Slots', 'Live casino', 'Sportsbook'],
        },
        { key: 'claimFrequency', label: 'Claim frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'], default: 'Weekly' },
        { key: 'tierMultiplier', label: 'Apply tier multiplier on top of matrix', type: 'toggle', default: true },
        { key: 'bonusBetEligible', label: 'Include bonus bets in the calculation', type: 'toggle', default: false, full: true, hint: 'usually excluded to prevent bonus abuse' },
      ],
    },
    {
      id: 'rakeback-payout', step: 'budget', title: 'Payout & KYC controls', icon: Wallet,
      fields: [
        { key: 'minPayout', label: 'Minimum claimable amount', type: 'number', prefix: '€', placeholder: 'e.g. 5' },
        { key: 'kycRequired', label: 'Require completed KYC before payout', type: 'toggle', default: true, full: true, hint: 'withholds cashback until identity is verified' },
        { key: 'kycInfo', label: '', type: 'info', tone: 'info', body: 'Cashback is a real-money payout. Keep the KYC hold on and confirm the jurisdiction mapping in the Safety gates below.' },
      ],
    },
  ],
};

// section matches the active subtype (or has no subtype gate)
function sectionMatches(section: ModuleSection, subtype: string): boolean {
  return !section.subtypes || section.subtypes.includes(subtype);
}

// field matches the active subtype (or has no subtype gate)
export function fieldMatchesSubtype(subtypes: string[] | undefined, subtype: string): boolean {
  return !subtypes || subtypes.includes(subtype);
}

// sections for a given type + step, honoring subtype gating
export function moduleSectionsForStep(
  typeId: CampaignTypeId | null,
  step: ModuleStep,
  subtype = '',
): ModuleSection[] {
  if (!typeId) return [];
  return (MODULE_SPECS[typeId] ?? []).filter((s) => s.step === step && sectionMatches(s, subtype));
}

export function hasModuleConfig(typeId: CampaignTypeId | null): boolean {
  if (!typeId) return false;
  return (MODULE_SPECS[typeId] ?? []).length > 0;
}

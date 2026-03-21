export type TierName =
  | 'Drewno'
  | 'Brąz'
  | 'Srebro'
  | 'Złoto'
  | 'Platyna'
  | 'Diament'
  | 'Master'
  | 'Challenger'
  | 'Legenda';

export interface RankEntry {
  id: number;
  tier: TierName;
  level: number | null;
  color: string;
  iconName: string;
}

// Kolory i ikony per tier (lucide-react-native)
const TIER_META: Record<TierName, { color: string; iconName: string }> = {
  Drewno:     { color: '#8B5E3C', iconName: 'TreePine' },
  Brąz:       { color: '#CD7F32', iconName: 'Shield' },
  Srebro:     { color: '#C0C0C0', iconName: 'ShieldCheck' },
  Złoto:      { color: '#FFD700', iconName: 'Crown' },
  Platyna:    { color: '#00CED1', iconName: 'Gem' },
  Diament:    { color: '#B9F2FF', iconName: 'Diamond' },
  Master:     { color: '#9B59B6', iconName: 'Swords' },
  Challenger: { color: '#E74C3C', iconName: 'Flame' },
  Legenda:    { color: '#FFD700', iconName: 'Star' },
};

const buildTier = (tier: TierName, startId: number, levels: number): RankEntry[] =>
  Array.from({ length: levels }, (_, i) => ({
    id: startId + i,
    tier,
    level: levels > 1 ? i + 1 : null,
    ...TIER_META[tier],
  }));

export const RANK_MAP: RankEntry[] = [
  ...buildTier('Drewno', 0, 4),
  ...buildTier('Brąz', 4, 4),
  ...buildTier('Srebro', 8, 4),
  ...buildTier('Złoto', 12, 4),
  ...buildTier('Platyna', 16, 4),
  ...buildTier('Diament', 20, 4),
  ...buildTier('Master', 24, 1),
  ...buildTier('Challenger', 25, 1),
  ...buildTier('Legenda', 26, 1),
];

export const getRankById = (rankId: number): RankEntry =>
  RANK_MAP.find(r => r.id === rankId) ?? RANK_MAP[0];

export const getRankDisplay = (rankId: number): string => {
  const rank = getRankById(rankId);
  return rank.level ? `${rank.tier} ${rank.level}` : rank.tier;
};
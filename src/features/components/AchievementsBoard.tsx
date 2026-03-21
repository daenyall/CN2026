import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  TreePine, Shield, ShieldCheck, Crown, Gem, Diamond,
  Swords, Flame, Star, Trophy, Lock,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { NeonCard } from './NeonCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { getRankById, getRankDisplay } from '../config/ranks';
import { ACHIEVEMENTS } from '../config/achievements';

interface AchievementsBoardProps {
  rankId: number;
  earnedMedals: string[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  TreePine,
  Shield,
  ShieldCheck,
  Crown,
  Gem,
  Diamond,
  Swords,
  Flame,
  Star,
  Trophy,
};

const resolveIcon = (name: string): LucideIcon => ICON_MAP[name] ?? Star;

export function AchievementsBoard({ rankId, earnedMedals }: AchievementsBoardProps) {
  const rank = getRankById(rankId);
  const RankIcon = resolveIcon(rank.iconName);

  const unlockedRules = ACHIEVEMENTS.filter(r => earnedMedals.includes(r.id));

  return (
    <View style={styles.wrapper}>
      {/* Ranga */}
      <NeonCard>
        <View style={styles.rankRow}>
          <View style={[styles.rankIconCircle, { borderColor: rank.color, shadowColor: rank.color }]}>
            <RankIcon size={28} color={rank.color} />
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankLabel}>Aktualna Ranga</Text>
            <Text style={[styles.rankName, { color: rank.color }]}>{getRankDisplay(rankId)}</Text>
          </View>
        </View>
      </NeonCard>

      {/* Medale */}
      <NeonCard>
        <Text style={styles.medalsTitle}>🏅 Odblokowane Medale</Text>
        {unlockedRules.length === 0 ? (
          <View style={styles.emptyState}>
            <Lock size={24} color={Colors.gray} />
            <Text style={styles.emptyText}>Brak odblokowanych medali. Trenuj dalej!</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.medalsRow}>
              {unlockedRules.map(rule => {
                const MedalIcon = resolveIcon(rule.iconName);
                return (
                  <View key={rule.id} style={styles.medalCard}>
                    <View style={styles.medalIconCircle}>
                      <MedalIcon size={22} color={Colors.gold} />
                    </View>
                    <Text style={styles.medalName} numberOfLines={2}>{rule.name}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </NeonCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rankIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  rankInfo: {
    flex: 1,
  },
  rankLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  rankName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  medalsTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  emptyText: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    flex: 1,
  },
  medalsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  medalCard: {
    width: 90,
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  medalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  medalName: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
});

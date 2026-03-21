import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { NeonCard } from './NeonCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { getRankDisplay } from '../config/ranks';
import type { ExerciseRankResult } from '../utils/rankCalculator';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExerciseRanksCardProps {
  exerciseRanks: ExerciseRankResult[];
  averageRankId: number;
}

export function ExerciseRanksCard({ exerciseRanks, averageRankId }: ExerciseRanksCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  };

  const avgRankDisplay = getRankDisplay(averageRankId);

  return (
    <NeonCard>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🏅</Text>
          <View>
            <Text style={styles.headerTitle}>Rangi Ćwiczeń</Text>
            <Text style={styles.headerSub}>Profil: {avgRankDisplay}</Text>
          </View>
        </View>
        {expanded ? (
          <ChevronUp size={22} color={Colors.gray} />
        ) : (
          <ChevronDown size={22} color={Colors.gray} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.listContainer}>
          {exerciseRanks.map(er => {
            const hasResult = er.bestValue > 0;
            return (
              <View key={er.exerciseId} style={styles.exerciseRow}>
                <Text style={styles.exerciseEmoji}>{er.emoji}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{er.name}</Text>
                  <Text style={styles.exerciseBest}>
                    {hasResult ? `Rekord: ${er.bestValue}${er.unit}` : 'Brak wyniku'}
                  </Text>
                </View>
                <View style={styles.rankBadgeWrapper}>
                  <View style={[styles.rankBadge, { borderColor: hasResult ? er.rank.color : Colors.gray }]}>
                    <Text style={[styles.rankBadgeText, { color: hasResult ? er.rank.color : Colors.gray }]}>
                      {hasResult ? getRankDisplay(er.rankId) : '—'}
                    </Text>
                  </View>
                  {hasResult && (
                    <Text style={[styles.percentText, { color: er.rank.color }]}>{er.percent}%</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </NeonCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  headerSub: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  listContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  exerciseEmoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  exerciseBest: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  rankBadgeWrapper: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  rankBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  rankBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  percentText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
});

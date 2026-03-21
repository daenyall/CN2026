import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { Medal, TrendingUp, TrendingDown, Flame } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { MOCK_STUDENTS } from '../data/MockStudents';

export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('week');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const rankings = [
    { rank: 1, name: 'Jakub Kowalski', class: '6A', score: 92, streak: 12, trend: 'up' },
    { rank: 2, name: 'Anna Nowak', class: '6B', score: 89, streak: 8, trend: 'up' },
    { rank: 3, name: 'Michał Wiśniewski', class: '6A', score: 87, streak: 15, trend: 'same' },
    { rank: 4, name: 'Zofia Lewandowska', class: '6C', score: 85, streak: 5, trend: 'down' },
    { rank: 5, name: 'Kacper Zieliński', class: '6B', score: 83, streak: 10, trend: 'up' },
    { rank: 6, name: 'Julia Kamińska', class: '6A', score: 81, streak: 3, trend: 'same' },
    { rank: 7, name: 'Filip Dąbrowski', class: '6C', score: 79, streak: 7, trend: 'up' },
    { rank: 8, name: 'Maja Piotrowska', class: '6B', score: 77, streak: 2, trend: 'down' },
    { rank: 9, name: 'Adam Kowalczyk', class: '6A', score: 75, streak: 9, trend: 'up' },
    { rank: 10, name: 'Oliwia Szymańska', class: '6C', score: 73, streak: 4, trend: 'same' },
  ];

  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return null;
  };

  const tabs = [
    { id: 'week' as const, label: 'Ten tydzień' },
    { id: 'month' as const, label: 'Ten miesiąc' },
    { id: 'all' as const, label: 'Wszech czasów' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.neonGreen} colors={[Colors.neonGreen]} />
        }
      >
        <View style={styles.innerPadding}>
          <Text style={styles.screenTitle}>🏆 Top 10 Szkoły</Text>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rankings List */}
          <View style={styles.rankingsList}>
            {rankings.map((player) => {
              const medalColor = getMedalColor(player.rank);
              const isFirst = player.rank === 1;
              const matchingStudent = MOCK_STUDENTS.find(s => s.name === player.name);

              return (
                <NeonCard
                  key={player.rank}
                  glow={isFirst}
                  style={isFirst ? styles.firstPlaceCard : undefined}
                >
                  <View
                    style={[
                      styles.rankingRow,
                      isFirst && styles.rankingRowFirst,
                    ]}
                  >
                    {/* Rank/Medal */}
                    <View style={[styles.rankBadge, isFirst && styles.rankBadgeFirst]}>
                      {medalColor ? (
                        <Medal
                          size={isFirst ? 32 : 28}
                          color={medalColor}
                          fill={medalColor}
                        />
                      ) : (
                        <Text style={[styles.rankNumber, isFirst && styles.rankNumberFirst]}>
                          {player.rank}
                        </Text>
                      )}
                    </View>

                    {/* Avatar */}
                    <View
                      style={[
                        styles.rankAvatar,
                        isFirst && styles.rankAvatarFirst,
                        { overflow: 'hidden', padding: 0 }
                      ]}
                    >
                      {matchingStudent?.avatar && matchingStudent.avatar.startsWith('http') ? (
                        <Image source={{ uri: matchingStudent.avatar }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <Text style={{ fontSize: isFirst ? 20 : 16 }}>👤</Text>
                      )}
                    </View>

                    {/* Name & Class */}
                    <View style={styles.rankInfo}>
                      <Text
                        style={[styles.rankName, isFirst && styles.rankNameFirst]}
                        numberOfLines={1}
                      >
                        {player.name}
                      </Text>
                      <View style={styles.rankMeta}>
                        <Text style={styles.rankClass}>Klasa {player.class}</Text>
                        {player.streak >= 7 && (
                          <View style={styles.streakBadge}>
                            <Flame size={12} color={Colors.orange} />
                            <Text style={styles.streakText}>{player.streak}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Score */}
                    <View
                      style={[
                        styles.scoreBadge,
                        isFirst ? styles.scoreBadgeFirst : styles.scoreBadgeNormal,
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreText,
                          isFirst ? styles.scoreTextFirst : styles.scoreTextNormal,
                        ]}
                      >
                        {player.score}
                      </Text>
                    </View>

                    {/* Trend */}
                    <View style={styles.trendContainer}>
                      {player.trend === 'up' && <TrendingUp size={20} color={Colors.neonGreen} />}
                      {player.trend === 'down' && <TrendingDown size={20} color={Colors.red} />}
                    </View>
                  </View>
                </NeonCard>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  innerPadding: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  screenTitle: {
    color: Colors.white,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: Spacing.xl,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  tabText: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.bgDeep,
  },
  rankingsList: {
    gap: Spacing.md,
  },
  firstPlaceCard: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 4,
  },
  rankingRowFirst: {
    paddingVertical: Spacing.sm,
  },
  rankBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeFirst: {
    width: 48,
    height: 48,
  },
  rankNumber: {
    color: Colors.gray,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  rankNumberFirst: {
    fontSize: FontSize.xl,
  },
  rankAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankAvatarFirst: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  rankInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankName: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
  rankNameFirst: {
    fontSize: FontSize.md,
  },
  rankMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rankClass: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    color: Colors.orange,
    fontSize: FontSize.xs,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  scoreBadgeFirst: {
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  scoreBadgeNormal: {
    backgroundColor: Colors.bgDeep,
  },
  scoreText: {
    fontWeight: '800',
  },
  scoreTextFirst: {
    color: Colors.bgDeep,
    fontSize: FontSize.lg,
  },
  scoreTextNormal: {
    color: Colors.neonGreen,
    fontSize: FontSize.md,
  },
  trendContainer: {
    width: 24,
    alignItems: 'center',
  },
});

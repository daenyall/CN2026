import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInLeft, Layout, ZoomIn } from 'react-native-reanimated';
import { Medal, TrendingUp, TrendingDown, Flame } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';

export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<"week" | "month" | "all">("week");

  const rankings = [
    { rank: 1, name: "Jakub Kowalski", class: "6A", score: 92, streak: 12, trend: "up" },
    { rank: 2, name: "Anna Nowak", class: "6B", score: 89, streak: 8, trend: "up" },
    { rank: 3, name: "Michał Wiśniewski", class: "6A", score: 87, streak: 15, trend: "same" },
    { rank: 4, name: "Zofia Lewandowska", class: "6C", score: 85, streak: 5, trend: "down" },
    { rank: 5, name: "Kacper Zieliński", class: "6B", score: 83, streak: 10, trend: "up" },
    { rank: 6, name: "Julia Kamińska", class: "6A", score: 81, streak: 3, trend: "same" },
    { rank: 7, name: "Filip Dąbrowski", class: "6C", score: 79, streak: 7, trend: "up" },
    { rank: 8, name: "Maja Piotrowska", class: "6B", score: 77, streak: 2, trend: "down" },
    { rank: 9, name: "Adam Kowalczyk", class: "6A", score: 75, streak: 9, trend: "up" },
    { rank: 10, name: "Oliwia Szymańska", class: "6C", score: 73, streak: 4, trend: "same" },
  ];

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return null;
  };

  const tabs = [
    { id: "week", label: "Ten tydzień" },
    { id: "month", label: "Ten miesiąc" },
    { id: "all", label: "Wszech czasów" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Animated.View entering={FadeInLeft} style={styles.header}>
        <Text style={styles.titleEmoji}>🏆</Text>
        <Text style={styles.title}>Top 10 Szkoły</Text>
      </Animated.View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as any)}
            style={[styles.tabButton]}
            activeOpacity={0.8}
          >
            {activeTab === tab.id && (
              <Animated.View layout={Layout.springify()} style={styles.activeTabBg} />
            )}
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.list}>
        {rankings.map((player, index) => {
          const medalColor = getMedalColor(player.rank);
          const isFirst = player.rank === 1;

          return (
            <Animated.View key={player.rank} entering={FadeInLeft.delay(index * 50)} layout={Layout.springify()}>
              <NeonCard glow={isFirst} style={[isFirst && styles.firstCard]}>
                <View style={[styles.row, isFirst && styles.rowFirst]}>
                  {/* Rank/Medal */}
                  <View style={[styles.rankBox, isFirst && styles.rankBoxFirst]}>
                    {medalColor ? (
                      <Animated.View entering={ZoomIn.delay(index * 50 + 200)}>
                        <Medal
                          size={isFirst ? 32 : 28}
                          color={medalColor}
                          fill={medalColor}
                        />
                      </Animated.View>
                    ) : (
                      <Text style={[styles.rankText, isFirst && styles.rankTextFirst]}>
                        {player.rank}
                      </Text>
                    )}
                  </View>

                  {/* Avatar */}
                  <View style={[styles.avatar, isFirst && styles.avatarFirst]}>
                    <Text style={isFirst ? styles.avatarEmojiFirst : styles.avatarEmoji}>👤</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.info}>
                    <Text style={[styles.name, isFirst && styles.nameFirst]} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>Klasa {player.class}</Text>
                      {player.streak >= 7 && (
                        <View style={styles.streakRow}>
                          <Flame size={12} color="#FF6D00" />
                          <Text style={styles.streakText}>{player.streak}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Score */}
                  <View style={[styles.scoreBox, isFirst && styles.scoreBoxFirst]}>
                    <Text style={[styles.scoreText, isFirst && styles.scoreTextFirst]}>
                      {player.score}
                    </Text>
                  </View>

                  {/* Trend */}
                  <View style={styles.trendBox}>
                    {player.trend === "up" && (
                      <Animated.View entering={ZoomIn.delay(index * 50 + 300)}>
                        <TrendingUp size={20} color="#00E676" />
                      </Animated.View>
                    )}
                    {player.trend === "down" && (
                      <Animated.View entering={ZoomIn.delay(index * 50 + 300)}>
                        <TrendingDown size={20} color="#FF1744" />
                      </Animated.View>
                    )}
                  </View>
                </View>
              </NeonCard>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  titleEmoji: {
    fontSize: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E2A3A',
    padding: 4,
    borderRadius: 999,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
    position: 'relative',
  },
  activeTabBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00E676', // Linear gradient is harder here without SVG or exact styling, using solid hex
    borderRadius: 999,
  },
  tabText: {
    color: '#8899AA',
    fontSize: 14,
    fontWeight: '600',
    zIndex: 2,
  },
  activeTabText: {
    color: '#0A0E1A',
  },
  list: {
    gap: 12,
  },
  firstCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  rowFirst: {
    paddingVertical: 8,
  },
  rankBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBoxFirst: {
    width: 48,
    height: 48,
  },
  rankText: {
    color: '#8899AA',
    fontSize: 16,
    fontWeight: '700',
  },
  rankTextFirst: {
    fontSize: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00A854', // simplified gradient equivalent
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFirst: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  avatarEmojiFirst: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  nameFirst: {
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metaText: {
    color: '#8899AA',
    fontSize: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    color: '#FF6D00',
    fontSize: 12,
  },
  scoreBox: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#0A0E1A',
    borderRadius: 999,
  },
  scoreBoxFirst: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00E676',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  scoreText: {
    color: '#00E676',
    fontWeight: '800',
    fontSize: 16,
  },
  scoreTextFirst: {
    color: '#0A0E1A',
    fontSize: 18,
  },
  trendBox: {
    width: 24,
    alignItems: 'center',
  }
});

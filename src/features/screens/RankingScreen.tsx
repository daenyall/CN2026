import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl, Modal, Animated } from 'react-native';
import { Medal, TrendingUp, TrendingDown, Flame } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { MOCK_STUDENTS } from '../data/MockStudents';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import StudentProfile from './StudentProfile';

export default function RankingScreen() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [liveRankings, setLiveRankings] = useState<any[]>([]);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const fetchRankings = async () => {
    try {
      const currentUser = auth.currentUser;
      let targetSchool = '';
      if (currentUser) {
        const uDoc = await getDoc(doc(db, 'students', currentUser.uid));
        targetSchool = (uDoc.data()?.school || '').trim().toLowerCase();
      }

      const usersSnap = await getDocs(collection(db, 'students'));
      let usersList: any[] = [];
      usersSnap.forEach((doc) => {
        usersList.push({ ...doc.data(), id: doc.id });
      });

      // Filter to same school (or fallback to all if no school set for safety)
      let studentsInSchool = usersList.filter(u => 
        !targetSchool || (u.school && u.school.trim().toLowerCase() === targetSchool)
      );

      // If no real students in school yet, fallback to mock so UI doesn't look broken,
      // but only if NO real students exist in school.
      if (studentsInSchool.length === 0) {
        studentsInSchool = [...MOCK_STUDENTS];
      }

      const sorted = studentsInSchool
        .map(student => {
          let score = student.overall;
          if (!score && student.stats) {
            score = Math.round(((student.stats.speed||0) + (student.stats.strength||0) + (student.stats.stamina||0) + (student.stats.jump||0) + (student.stats.agility||0)) / 5);
          }
          return { ...student, score: score || 0 };
        })
        .sort((a, b) => b.score - a.score)
        .map((s, index) => ({
          rank: index + 1,
          name: s.name || s.displayName || 'Brak Imienia',
          class: s.class || '-',
          score: s.score,
          streak: s.currentStreak || 0,
          trend: index % 4 === 0 ? 'down' : (index % 2 === 0 ? 'up' : 'same'),
          id: s.id,
          avatar: s.avatar || s.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'Brak')}&&background=00E676&color=fff`
        }));

      setLiveRankings(sorted);
    } catch (e) {
      console.error('Error fetching rankings', e);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchRankings();
    setRefreshing(false);
  }, []);

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

  const handleTabPress = (index: number, tabId: 'week' | 'month' | 'all') => {
    setActiveTab(tabId);
    Animated.spring(slideAnim, {
      toValue: index,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start();
  };

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
          <View 
            style={styles.tabsContainer} 
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {containerWidth > 0 && (
              <Animated.View
                style={[
                  styles.animatedPill,
                  {
                    width: (containerWidth - 8) / 3, // 8 is total horizontal padding
                    transform: [
                      {
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 1, 2],
                          outputRange: [0, (containerWidth - 8) / 3, ((containerWidth - 8) / 3) * 2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                style={styles.tab}
                activeOpacity={0.7}
                onPress={() => handleTabPress(index, tab.id)}
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
            {liveRankings.map((player) => {
              const medalColor = getMedalColor(player.rank);
              const isFirst = player.rank === 1;

              return (
                <TouchableOpacity
                  key={player.rank}
                  activeOpacity={0.8}
                  onPress={() => setSelectedStudentId(player.id)}
                >
                  <NeonCard
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
                        {player.avatar && player.avatar.startsWith('http') ? (
                          <Image source={{ uri: player.avatar }} style={{ width: '100%', height: '100%' }} />
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
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Slide-up Profile Modal */}
      <Modal
        visible={!!selectedStudentId}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedStudentId(null)}
      >
        {selectedStudentId && (
          <StudentProfile 
            studentId={selectedStudentId} 
            onClose={() => setSelectedStudentId(null)} 
          />
        )}
      </Modal>
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
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  animatedPill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: Colors.neonGreen,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabText: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
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

import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { Flame, Trophy, Zap, Crown } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { BottomNav } from '../components/BottomNav';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { updateStreak, getBonusPoints, getStreakMilestone } from '../utils/streakUtils';

export default function StreakScreen() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);

  const counterScale = useRef(new Animated.Value(0.8)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load streak from AsyncStorage
    updateStreak().then((streak) => {
      setCurrentStreak(streak);
      setBonusPoints(getBonusPoints(streak));
    });

    Animated.spring(counterScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Animate progress bar when streak changes
  useEffect(() => {
    // Next milestone: 7, 14, or 30
    let nextMilestone = 7;
    if (currentStreak >= 7) nextMilestone = 14;
    if (currentStreak >= 14) nextMilestone = 30;
    const progress = Math.min((currentStreak / nextMilestone) * 100, 100);

    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 1000,
      delay: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStreak]);

  const daysToNextMilestone = (() => {
    if (currentStreak < 7) return 7 - currentStreak;
    if (currentStreak < 14) return 14 - currentStreak;
    if (currentStreak < 30) return 30 - currentStreak;
    return 0;
  })();

  const nextMilestoneLabel = (() => {
    if (currentStreak < 7) return '🔥 Tygodniowy Wojownik';
    if (currentStreak < 14) return '⚡ Niezniszczalny';
    if (currentStreak < 30) return '👑 Legenda Szkoły';
    return '🏆 Wszystko zdobyte!';
  })();

  const milestones = [
    { days: 7, label: 'Tygodniowy Wojownik', Icon: Flame, unlocked: currentStreak >= 7 },
    { days: 14, label: 'Niezniszczalny', Icon: Zap, unlocked: currentStreak >= 14 },
    { days: 30, label: 'Legenda Szkoły', Icon: Crown, unlocked: currentStreak >= 30 },
  ];

  const days = Array.from({ length: 30 }, (_, i) => {
    const daysAgo = 29 - i;
    if (daysAgo < 12) return 'active';
    if (daysAgo >= 12 && daysAgo < 18) return 'inactive';
    if (daysAgo >= 18) return 'active';
    return 'inactive';
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>
          <Text style={styles.screenTitle}>🔥 Twoja Passa Treningowa</Text>

          {/* Main Streak Counter */}
          <Animated.View style={[styles.counterContainer, { transform: [{ scale: counterScale }] }]}>
            <NeonCard glow>
              <View style={styles.counterContent}>
                <Animated.View style={{ transform: [{ scale: flameScale }] }}>
                  <NeonIcon Icon={Flame} size={64} color={Colors.orange} glow />
                </Animated.View>
                <Text style={styles.counterNumber}>{currentStreak}</Text>
                <Text style={styles.counterLabel}>dni z rzędu</Text>
              </View>
            </NeonCard>
          </Animated.View>

          {/* Progress to Next Badge */}
          <View style={styles.sectionSpacing}>
            <NeonCard>
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Do odznaki {nextMilestoneLabel}</Text>
                  <Text style={styles.progressValue}>{daysToNextMilestone} dni</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFillOrange,
                      {
                        width: progressWidth.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            </NeonCard>
          </View>

          {/* Milestones */}
          <View style={styles.milestonesList}>
            {milestones.map((milestone) => (
              <NeonCard key={milestone.days} glow={milestone.unlocked}>
                <View style={styles.milestoneRow}>
                  <View
                    style={[
                      styles.milestoneIcon,
                      milestone.unlocked ? styles.milestoneIconUnlocked : styles.milestoneIconLocked,
                    ]}
                  >
                    <NeonIcon
                      Icon={milestone.Icon}
                      size={24}
                      color={milestone.unlocked ? Colors.gold : Colors.gray}
                      glow={milestone.unlocked}
                    />
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text
                      style={[
                        styles.milestoneTitle,
                        { color: milestone.unlocked ? Colors.white : Colors.gray },
                      ]}
                    >
                      {milestone.unlocked ? '🔥' : '🔒'} {milestone.days} dni — {milestone.label}
                    </Text>
                    <Text style={styles.milestoneSub}>
                      {milestone.unlocked ? 'Zdobyte!' : 'Zablokowane'}
                    </Text>
                  </View>
                  {milestone.unlocked && <Trophy size={24} color={Colors.gold} />}
                </View>
              </NeonCard>
            ))}
          </View>

          {/* Calendar */}
          <View style={styles.sectionSpacing}>
            <NeonCard>
              <Text style={styles.calendarTitle}>Ostatnie 30 dni</Text>
              <View style={styles.calendarGrid}>
                {days.map((status, index) => (
                  <View
                    key={index}
                    style={[
                      styles.calendarDot,
                      status === 'active' ? styles.calendarDotActive : styles.calendarDotInactive,
                    ]}
                  />
                ))}
              </View>
            </NeonCard>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <NeonCard>
                <View style={styles.statsContent}>
                  <Text style={styles.statsValueGold}>{bonusPoints}</Text>
                  <Text style={styles.statsLabel}>Punkty bonusowe</Text>
                </View>
              </NeonCard>
            </View>
            <View style={styles.statsItem}>
              <NeonCard>
                <View style={styles.statsContent}>
                  <Text style={styles.statsValueGreen}>{currentStreak}</Text>
                  <Text style={styles.statsLabel}>Rekord ever</Text>
                </View>
              </NeonCard>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav type="student" />
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
  counterContainer: {
    marginBottom: Spacing.xl,
  },
  counterContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  counterNumber: {
    fontSize: FontSize['8xl'],
    color: Colors.orange,
    fontWeight: '900',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  counterLabel: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  sectionSpacing: {
    marginBottom: Spacing.xl,
  },
  progressSection: {
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  progressValue: {
    color: Colors.neonGreen,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.bgDeep,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFillOrange: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.orange,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  milestonesList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIconUnlocked: {
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  milestoneIconLocked: {
    backgroundColor: Colors.bgDeep,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  milestoneSub: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  calendarTitle: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  calendarDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  calendarDotActive: {
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarDotInactive: {
    backgroundColor: 'rgba(136, 153, 170, 0.3)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.xl,
  },
  statsItem: {
    flex: 1,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statsValueGold: {
    color: Colors.gold,
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  statsValueGreen: {
    color: Colors.neonGreen,
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  statsLabel: {
    color: Colors.gray,
    fontSize: FontSize.sm,
  },
});

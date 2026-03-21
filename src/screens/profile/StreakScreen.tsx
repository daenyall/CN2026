import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Flame, Trophy, Zap, Crown } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';
import { NeonIcon } from '../../components/NeonIcon';
import Svg, { Defs, RadialGradient, Stop, Rect, LinearGradient } from 'react-native-svg';

export default function StreakScreen() {
  const milestones = [
    { days: 7, label: "Tygodniowy Wojownik", icon: Flame, unlocked: true },
    { days: 14, label: "Niezniszczalny", icon: Zap, unlocked: false },
    { days: 30, label: "Legenda Szkoły", icon: Crown, unlocked: false },
  ];

  const days = Array.from({ length: 30 }, (_, i) => {
    const daysAgo = 29 - i;
    if (daysAgo < 12) return "active";
    if (daysAgo >= 12 && daysAgo < 18) return "inactive";
    if (daysAgo >= 18) return "active";
    return "inactive";
  });
  
  const progWidth = useSharedValue(0);
  React.useEffect(() => {
    progWidth.value = withTiming(85, { duration: 1000 });
  }, []);
  
  const progAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progWidth.value}%`
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <Text style={styles.headerEmoji}>🔥</Text>
        <Text style={styles.headerTitle}>Twoja Passa Treningowa</Text>
      </Animated.View>

      <Animated.View entering={ZoomIn.delay(200)} style={styles.mainStreak}>
        <NeonCard glow={true}>
          <View style={styles.streakContent}>
            <View style={StyleSheet.absoluteFill}>
              <Svg height="100%" width="100%">
                <Defs>
                  <RadialGradient id="fireGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#FF6D00" stopOpacity="0.3" />
                    <Stop offset="70%" stopColor="#FF6D00" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#fireGrad)" />
              </Svg>
            </View>
            
            <View style={styles.flameIcon}>
              <NeonIcon Icon={Flame} size={64} color="#FF6D00" glow={true} animate={true} />
            </View>
            
            <Text style={styles.streakNumber}>12</Text>
            <Text style={styles.streakLabel}>dni z rzędu</Text>
          </View>
        </NeonCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <NeonCard>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Do odznaki ⚡ Niezniszczalny</Text>
            <Text style={styles.progressValue}>2 dni</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, progAnimatedStyle]}>
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                <Defs>
                  <LinearGradient id="progGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#FF6D00" />
                    <Stop offset="1" stopColor="#FF1744" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#progGrad)" />
              </Svg>
            </Animated.View>
          </View>
        </NeonCard>
      </Animated.View>

      <View style={styles.milestonesList}>
        {milestones.map((milestone, index) => (
          <Animated.View key={milestone.days} entering={FadeInDown.delay(400 + index * 100)}>
            <NeonCard glow={milestone.unlocked}>
              <View style={styles.milestoneRow}>
                <View style={[styles.milestoneIconBg, milestone.unlocked && styles.milestoneIconBgActive]}>
                  {milestone.unlocked && (
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                      <Defs>
                        <LinearGradient id={`msGrad-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <Stop offset="0" stopColor="#00E676" />
                          <Stop offset="1" stopColor="#00A854" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill={`url(#msGrad-${index})`} rx="24" />
                    </Svg>
                  )}
                  <NeonIcon
                    Icon={milestone.icon}
                    size={24}
                    color={milestone.unlocked ? "#FFD700" : "#8899AA"}
                    glow={milestone.unlocked}
                  />
                </View>
                <View style={styles.milestoneInfo}>
                  <Text style={[styles.milestoneTitle, milestone.unlocked && styles.milestoneTitleActive]}>
                    {milestone.unlocked ? "🔥" : "🔒"} {milestone.days} dni — {milestone.label}
                  </Text>
                  <Text style={styles.milestoneSubtitle}>
                    {milestone.unlocked ? "Zdobyte!" : "Zablokowane"}
                  </Text>
                </View>
                {milestone.unlocked && (
                  <Animated.View entering={ZoomIn.delay(600 + index * 100)}>
                    <Trophy size={24} color="#FFD700" />
                  </Animated.View>
                )}
              </View>
            </NeonCard>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
        <NeonCard>
          <Text style={styles.calendarTitle}>Ostatnie 30 dni</Text>
          <View style={styles.calendarGrid}>
            {days.map((status, index) => (
              <Animated.View
                key={index}
                entering={ZoomIn.delay(800 + index * 20)}
                style={[
                  styles.calendarDay,
                  status === "active" ? styles.calendarDayActive :
                  status === "inactive" ? styles.calendarDayInactive :
                  styles.calendarDayMissed
                ]}
              />
            ))}
          </View>
        </NeonCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(900)} style={styles.statsGrid}>
        <View style={styles.statCell}>
          <NeonCard>
            <View style={styles.statContent}>
              <Text style={styles.statValueYellow}>240</Text>
              <Text style={styles.statLabel}>Punkty bonusowe</Text>
            </View>
          </NeonCard>
        </View>
        <View style={styles.statCell}>
          <NeonCard>
            <View style={styles.statContent}>
              <Text style={styles.statValueGreen}>18</Text>
              <Text style={styles.statLabel}>Rekord ever</Text>
            </View>
          </NeonCard>
        </View>
      </Animated.View>
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
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  mainStreak: {
    marginBottom: 24,
  },
  streakContent: {
    alignItems: 'center',
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  flameIcon: {
    marginBottom: 16,
  },
  streakNumber: {
    color: '#FF6D00',
    fontSize: 80,
    fontWeight: '900',
    lineHeight: 90,
  },
  streakLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#0A0E1A',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    shadowColor: '#FF6D00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  milestonesList: {
    gap: 12,
    marginBottom: 24,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  milestoneIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  milestoneIconBgActive: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    color: '#8899AA',
    fontSize: 14,
    fontWeight: '700',
  },
  milestoneTitleActive: {
    color: '#FFFFFF',
  },
  milestoneSubtitle: {
    color: '#8899AA',
    fontSize: 12,
  },
  calendarTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarDay: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  calendarDayActive: {
    backgroundColor: '#00E676',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarDayInactive: {
    backgroundColor: 'rgba(136, 153, 170, 0.3)',
  },
  calendarDayMissed: {
    backgroundColor: 'rgba(255, 23, 68, 0.3)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCell: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValueYellow: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  statValueGreen: {
    color: '#00E676',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8899AA',
    fontSize: 14,
  }
});

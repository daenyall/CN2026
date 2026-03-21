import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, withRepeat, withSequence, FadeInDown, Layout } from 'react-native-reanimated';
import { Download, Flame, CheckCircle } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';
import { NeonIcon } from '../../components/NeonIcon';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { VictoryChart, VictoryPolarAxis, VictoryArea } from 'victory-native';

export default function ProfileScreen() {
  const radarData = [
    { x: "Szybkość", y: 92 },
    { x: "Siła", y: 78 },
    { x: "Wytrzymałość", y: 85 },
    { x: "Skoczność", y: 88 },
    { x: "Zwinność", y: 90 },
  ];

  const stats = [
    { label: "Szybk.", value: 92 },
    { label: "Siła", value: 78 },
    { label: "Wytrzym.", value: 85 },
    { label: "Skok", value: 88 },
    { label: "Zwinność", value: 90 },
  ];

  const avatarScale = useSharedValue(1);
  const scoreGlow = useSharedValue(40);
  
  useEffect(() => {
    scoreGlow.value = withRepeat(
      withSequence(
        withTiming(60, { duration: 1000 }),
        withTiming(40, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const handleAvatarPressIn = () => {
    avatarScale.value = withSpring(1.05);
  };
  const handleAvatarPressOut = () => {
    avatarScale.value = withSpring(1);
  };
  
  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }]
  }));
  
  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    shadowRadius: scoreGlow.value,
    elevation: scoreGlow.value / 2,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity 
          onPressIn={handleAvatarPressIn} 
          onPressOut={handleAvatarPressOut}
          activeOpacity={1}
        >
          <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
              <Defs>
                <LinearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#00E676" />
                  <Stop offset="1" stopColor="#00A854" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#avatarGrad)" rx="40" />
            </Svg>
            <Text style={styles.avatarEmoji}>👤</Text>
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>Jakub Kowalski</Text>
          <Text style={styles.subname}>14 lat • Klasa 6A</Text>
        </View>
        <TouchableOpacity style={styles.schoolIcon} activeOpacity={0.8}>
          <Text style={styles.schoolEmoji}>🏫</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overall Score */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.scoreContainer}>
        <Animated.View style={[styles.scoreCircle, scoreAnimatedStyle]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFD700" />
                <Stop offset="1" stopColor="#FFA000" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#scoreGrad)" rx="48" />
          </Svg>
          <Text style={styles.scoreNumber}>87</Text>
        </Animated.View>
      </Animated.View>

      {/* Radar Chart */}
      <Animated.View entering={FadeInDown.delay(300)}>
        <NeonCard glow={true} style={styles.chartCard}>
          <View pointerEvents="none" style={styles.chartWrapper}>
            <VictoryChart polar domain={{ y: [0, 100] }} height={280} padding={30}>
              <VictoryPolarAxis
                labelPlacement="vertical"
                style={{
                  axis: { stroke: "#8899AA", strokeWidth: 1 },
                  grid: { stroke: "#8899AA", strokeWidth: 0.5 },
                  tickLabels: { fill: "#FFFFFF", fontSize: 10, fontWeight: "600", padding: 15 }
                }}
              />
              <VictoryPolarAxis dependentAxis
                style={{
                  axis: { stroke: "none" },
                  grid: { stroke: "#8899AA", strokeWidth: 0.5 },
                  tickLabels: { fill: "transparent" }
                }}
              />
              <VictoryArea
                data={radarData}
                style={{
                  data: { fill: "#00E676", fillOpacity: 0.4, stroke: "#00E676", strokeWidth: 3 }
                }}
              />
            </VictoryChart>
          </View>
        </NeonCard>
      </Animated.View>

      {/* Stats Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={styles.pillsContent}>
        {stats.map((stat, index) => (
          <Animated.View key={stat.label} entering={FadeInDown.delay(400 + index * 50)} style={styles.pill}>
            <Text style={styles.pillLabel}>{stat.label}</Text>
            <Text style={styles.pillValue}>{stat.value}</Text>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Streak Badge */}
      <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
        <NeonCard style={styles.streakCardPadding}>
          <View style={styles.streakBadge}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
              <Defs>
                <LinearGradient id="streakGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#FF6D00" />
                  <Stop offset="1" stopColor="#FF1744" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#streakGrad)" rx="999" />
            </Svg>
            <View style={styles.streakBadgeContent}>
              <View style={styles.streakBadgeLeft}>
                <NeonIcon Icon={Flame} size={24} color="#FFD700" />
                <Text style={styles.streakBadgeText}>🔥 12 dni z rzędu</Text>
              </View>
              <Text style={styles.streakBadgeRight}>+240 pkt bonus</Text>
            </View>
          </View>
        </NeonCard>
      </Animated.View>

      {/* Badges Grid */}
      <View style={styles.badgesGrid}>
        <Animated.View entering={FadeInDown.delay(700)} style={styles.badgeItem}>
          <NeonCard>
            <View style={styles.badgeContent}>
              <NeonIcon Icon={Flame} size={20} color="#FF6D00" />
              <View style={styles.badgeTexts}>
                <Text style={styles.badgeTitleOrange}>Underdog +15%</Text>
                <Text style={styles.badgeSubtitle}>Bonus za rozwój</Text>
              </View>
            </View>
          </NeonCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)} style={styles.badgeItem}>
          <NeonCard>
            <View style={styles.badgeContent}>
              <NeonIcon Icon={CheckCircle} size={20} color="#00E676" />
              <View style={styles.badgeTexts}>
                <Text style={styles.badgeTitleGreen}>Photo-Check ✅</Text>
                <Text style={styles.badgeSubtitle}>Zweryfikowano</Text>
              </View>
            </View>
          </NeonCard>
        </Animated.View>
      </View>

      {/* Download Button */}
      <Animated.View entering={FadeInDown.delay(800)} style={styles.section}>
        <TouchableOpacity activeOpacity={0.8} style={styles.downloadButton}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#00E676" />
                <Stop offset="1" stopColor="#00A854" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#btnGrad)" rx="28" />
          </Svg>
          <Download size={20} color="#0A0E1A" />
          <Text style={styles.downloadText}>📄 Pobierz Paszport PDF</Text>
        </TouchableOpacity>
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
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  avatarEmoji: {
    fontSize: 40,
    zIndex: 2,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subname: {
    color: '#8899AA',
    fontSize: 14,
  },
  schoolIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1E2A3A',
    borderColor: '#00E676',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolEmoji: {
    fontSize: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
  },
  scoreNumber: {
    color: '#0A0E1A',
    fontSize: 48,
    fontWeight: '900',
    zIndex: 2,
  },
  chartCard: {
    padding: 0,
    overflow: 'hidden',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -20,
  },
  pillsScroll: {
    marginTop: 16,
    marginBottom: 8,
  },
  pillsContent: {
    gap: 8,
    paddingRight: 24,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1E2A3A',
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
  },
  pillLabel: {
    color: '#8899AA',
    fontSize: 12,
    marginBottom: 4,
  },
  pillValue: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
  },
  streakCardPadding: {
    padding: 0,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  streakBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  streakBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  streakBadgeRight: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 14,
  },
  badgesGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  badgeItem: {
    flex: 1,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  badgeTexts: {
    flex: 1,
  },
  badgeTitleOrange: {
    color: '#FF6D00',
    fontSize: 14,
    fontWeight: '700',
  },
  badgeTitleGreen: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '700',
  },
  badgeSubtitle: {
    color: '#8899AA',
    fontSize: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  downloadText: {
    color: '#0A0E1A',
    fontWeight: '700',
    fontSize: 16,
    zIndex: 2,
  }
});

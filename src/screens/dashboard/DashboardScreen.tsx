import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { BarChart3, Play, Trophy, Map as MapIcon, Flame, Gift } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';
import { NeonIcon } from '../../components/NeonIcon';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();

  const titleOpacity = useSharedValue(0);
  const titleTranslateX = useSharedValue(-20);
  const avatarOpacity = useSharedValue(0);
  const avatarScale = useSharedValue(0);

  const flameScale = useSharedValue(1);
  const flameRotate = useSharedValue(0);
  
  const giftRotate = useSharedValue(0);

  // Entrance animations arrays
  const navCardOpacities = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const navCardTranslateY = [useSharedValue(20), useSharedValue(20), useSharedValue(20), useSharedValue(20)];

  const activityOpacities = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const activityTranslateX = [useSharedValue(-20), useSharedValue(-20), useSharedValue(-20)];
  
  const lootboxOpacity = useSharedValue(0);
  const lootboxTranslateY = useSharedValue(20);

  useEffect(() => {
    // Header
    titleOpacity.value = withTiming(1, { duration: 500 });
    titleTranslateX.value = withTiming(0, { duration: 500 });
    avatarOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    avatarScale.value = withDelay(200, withTiming(1, { duration: 500 }));

    // Flame pulsing
    flameScale.value = withRepeat(withSequence(withTiming(1.1, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, false);
    flameRotate.value = withRepeat(withSequence(withTiming(10, { duration: 500 }), withTiming(-10, { duration: 1000 }), withTiming(0, { duration: 500 })), -1, false);

    // Gift rotating
    giftRotate.value = withRepeat(withSequence(
      withTiming(-10, { duration: 375 }),
      withTiming(10, { duration: 375 }),
      withTiming(-10, { duration: 375 }),
      withTiming(0, { duration: 375 })
    ), -1, false);

    // Nav Cards
    navCardOpacities.forEach((v, i) => { v.value = withDelay(100 * i, withTiming(1, { duration: 500 })); });
    navCardTranslateY.forEach((v, i) => { v.value = withDelay(100 * i, withTiming(0, { duration: 500 })); });

    // Recent Activity
    activityOpacities.forEach((v, i) => { v.value = withDelay(500 + 100 * i, withTiming(1, { duration: 500 })); });
    activityTranslateX.forEach((v, i) => { v.value = withDelay(500 + 100 * i, withTiming(0, { duration: 500 })); });

    // Lootbox
    lootboxOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    lootboxTranslateY.value = withDelay(800, withTiming(0, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateX: titleTranslateX.value }]
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    opacity: avatarOpacity.value,
    transform: [{ scale: avatarScale.value }]
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }, { rotate: `${flameRotate.value}deg` }]
  }));

  const giftStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${giftRotate.value}deg` }]
  }));

  const navCards = [
    { icon: BarChart3, label: "Mój Profil", path: "ProfileScreen", emoji: "📊" },
    { icon: Play, label: "Nowy Test", path: "TestFormScreen", emoji: "🏃" },
    { icon: Trophy, label: "Ranking", path: "RankingScreen", emoji: "🏆" },
    { icon: MapIcon, label: "Mapa Talentów", path: "StreakScreen", emoji: "🗺" },
  ];

  const recentActivity = [
    { date: "18 marca 2026", test: "Bieg 100m", result: "13.2s", trend: "+0.3s" },
    { date: "15 marca 2026", test: "Skok w dal", result: "178cm", trend: "+5cm" },
    { date: "12 marca 2026", test: "Plank", result: "125s", trend: "+8s" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Animated.Text style={[styles.title, titleStyle]}>
            Cześć, Jakub! 👋
          </Animated.Text>
        </View>
        <Animated.View style={[styles.avatarContainer, avatarStyle]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#00E676" />
                <Stop offset="1" stopColor="#00A854" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#avatarGrad)" rx="24" />
          </Svg>
          <Text style={styles.avatarEmoji}>👤</Text>
        </Animated.View>
      </View>

      {/* Streak Card */}
      <View style={styles.section}>
        <NeonCard glow={true} onClick={() => navigation.navigate("StreakScreen")}>
          <View style={styles.streakRow}>
            <Animated.View style={flameStyle}>
              <NeonIcon Icon={Flame} size={48} color="#FF6D00" glow={true} />
            </Animated.View>
            <View style={styles.streakContent}>
              <Text style={styles.streakNumber}>12</Text>
              <Text style={styles.streakText}>dni z rzędu</Text>
              <Text style={styles.streakSubtext}>Nie przerywaj! Następny trening: do wtorku</Text>
            </View>
          </View>
        </NeonCard>
      </View>

      {/* Navigation Grid */}
      <View style={styles.section}>
        <View style={styles.grid}>
          {navCards.map((card, index) => {
            const cardStyle = useAnimatedStyle(() => ({
              opacity: navCardOpacities[index].value,
              transform: [{ translateY: navCardTranslateY[index].value }]
            }));
            
            return (
              <Animated.View key={card.label} style={[styles.gridItem, cardStyle]}>
                <NeonCard onClick={() => navigation.navigate(card.path)}>
                  <View style={styles.navCardContent}>
                    <Text style={styles.navCardEmoji}>{card.emoji}</Text>
                    <Text style={styles.navCardLabel}>{card.label}</Text>
                  </View>
                </NeonCard>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ostatnia aktywność</Text>
        <View style={styles.activityList}>
          {recentActivity.map((activity, index) => {
            const actStyle = useAnimatedStyle(() => ({
              opacity: activityOpacities[index].value,
              transform: [{ translateX: activityTranslateX[index].value }]
            }));
            return (
              <Animated.View key={index} style={actStyle}>
                <NeonCard>
                  <View style={styles.activityRow}>
                    <View>
                      <Text style={styles.activityTest}>{activity.test}</Text>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={styles.activityResult}>{activity.result}</Text>
                      <Text style={styles.activityTrend}>{activity.trend}</Text>
                    </View>
                  </View>
                </NeonCard>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Lootbox Banner */}
      <Animated.View style={[styles.section, { opacity: lootboxOpacity, transform: [{ translateY: lootboxTranslateY }] }]}>
        <NeonCard glow={true}>
          <View style={styles.lootRow}>
            <Animated.View style={giftStyle}>
              <NeonIcon Icon={Gift} size={32} color="#FFD700" glow={true} />
            </Animated.View>
            <View style={styles.lootTextContainer}>
              <Text style={styles.lootText}>🎁 Zrób test dziś i zdobądź Lootbox!</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.lootButton}
            onPress={() => navigation.navigate("TestFormScreen")}
            activeOpacity={0.8}
          >
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
              <Defs>
                <LinearGradient id="btnGrad2" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#00E676" />
                  <Stop offset="1" stopColor="#00A854" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#btnGrad2)" rx="20" />
            </Svg>
            <Text style={styles.lootButtonText}>Idę trenować</Text>
          </TouchableOpacity>
        </NeonCard>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 20,
    zIndex: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    color: '#FF6D00',
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 4,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  streakSubtext: {
    color: '#8899AA',
    fontSize: 12,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridItem: {
    width: '47%',
  },
  navCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  navCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  navCardLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTest: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activityDate: {
    color: '#8899AA',
    fontSize: 12,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityResult: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '700',
  },
  activityTrend: {
    color: '#8899AA',
    fontSize: 12,
  },
  lootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lootTextContainer: {
    flex: 1,
  },
  lootText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  lootButton: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lootButtonText: {
    color: '#0A0E1A',
    fontWeight: '700',
    zIndex: 2,
  }
});

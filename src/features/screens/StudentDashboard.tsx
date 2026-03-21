import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Image, RefreshControl } from 'react-native';
import { BarChart3, Play, Trophy, Map, Flame, Gift, LogOut } from 'lucide-react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, StudentTabParamList } from '../routes';

import { MOCK_STUDENTS } from '../data/MockStudents';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { CommonActions } from '@react-navigation/native';

type DashboardNavProp = CompositeNavigationProp<
  MaterialTopTabNavigationProp<StudentTabParamList, 'StudentDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function StudentDashboard() {
  const student = MOCK_STUDENTS[0];
  const navigation = useNavigation<DashboardNavProp>();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
      );
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateX = useRef(new Animated.Value(-20)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerTranslateX, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.spring(avatarScale, { toValue: 1, delay: 200, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const navCards = [
    { icon: BarChart3, label: 'Mój Profil', path: 'StudentProfile' as const, emoji: '📊' },
    { icon: Play, label: 'Nowy Test', path: 'TestForm' as const, emoji: '🏃' },
    { icon: Trophy, label: 'Ranking', path: 'RankingScreen' as const, emoji: '🏆' },
    { icon: Map, label: 'Mapa Talentów', path: 'StreakScreen' as const, emoji: '🗺' },
  ];

  const recentActivity = [
    { date: '18 marca 2026', test: 'Bieg 100m', result: '13.2s', trend: '+0.3s' },
    { date: '15 marca 2026', test: 'Skok w dal', result: '178cm', trend: '+5cm' },
    { date: '12 marca 2026', test: 'Plank', result: '125s', trend: '+8s' },
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
        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={{ opacity: headerOpacity, transform: [{ translateX: headerTranslateX }] }}
          >
            <Text style={styles.headerTitle}>Cześć, {student.name.split(' ')[0]}! 👋</Text>
          </Animated.View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Animated.View
              style={[
                styles.avatar,
                {
                  transform: [{ scale: avatarScale }],
                  shadowColor: Colors.neonGreen,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 6,
                  padding: 0,
                  overflow: 'hidden'
                },
              ]}
            >
              {student.avatar && student.avatar.startsWith('http') ? (
                <Image source={{ uri: student.avatar }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
            </Animated.View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} color={Colors.red} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Card */}
        <View style={styles.section}>
          <NeonCard glow onClick={() => navigation.navigate('StreakScreen')}>
            <View style={styles.streakRow}>
              <View style={styles.streakLeft}>
                <Animated.View style={{ transform: [{ scale: flameScale }] }}>
                  <NeonIcon Icon={Flame} size={48} color={Colors.orange} glow />
                </Animated.View>
                <View>
                  <Text style={styles.streakNumber}>12</Text>
                  <Text style={styles.streakLabel}>dni z rzędu</Text>
                  <Text style={styles.streakSub}>Nie przerywaj! Następny trening: do wtorku</Text>
                </View>
              </View>
            </View>
          </NeonCard>
        </View>

        {/* Navigation Grid */}
        <View style={styles.section}>
          <View style={styles.navGrid}>
            {navCards.map((card) => (
              <View key={card.label} style={styles.navGridItem}>
                <NeonCard onClick={() => navigation.navigate(card.path)}>
                  <View style={styles.navCardContent}>
                    <Text style={styles.navEmoji}>{card.emoji}</Text>
                    <Text style={styles.navLabel}>{card.label}</Text>
                  </View>
                </NeonCard>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ostatnia aktywność</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <NeonCard key={index}>
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
            ))}
          </View>
        </View>

        {/* Lootbox Banner */}
        <View style={styles.section}>
          <NeonCard glow>
            <View style={styles.lootboxRow}>
              <NeonIcon Icon={Gift} size={32} color={Colors.gold} glow />
              <View style={styles.lootboxTextContainer}>
                <Text style={styles.lootboxText}>🎁 Zrób test dziś i zdobądź Lootbox!</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.lootboxButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TestForm')}
            >
              <Text style={styles.lootboxButtonText}>Idę trenować</Text>
            </TouchableOpacity>
          </NeonCard>
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
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
  },
  avatarText: {
    fontSize: 20,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  streakNumber: {
    fontSize: FontSize['6xl'],
    color: Colors.orange,
    fontWeight: '800',
    marginBottom: 4,
  },
  streakLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  streakSub: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  navGridItem: {
    width: '47%',
  },
  navCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  navEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  navLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  activityList: {
    gap: Spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTest: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  activityDate: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityResult: {
    color: Colors.neonGreen,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  activityTrend: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  lootboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  lootboxTextContainer: {
    flex: 1,
  },
  lootboxText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  lootboxButton: {
    width: '100%',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
  },
  lootboxButtonText: {
    color: Colors.bgDeep,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});

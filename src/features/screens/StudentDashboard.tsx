import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Image, ActivityIndicator, RefreshControl, Easing, Dimensions,
} from 'react-native';
import {
  BarChart3, Trophy, Flame, Gift, LogOut, ClipboardList,
  User, MapPin, Zap, TrendingUp, Star, ChevronRight, Award,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, CompositeNavigationProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, StudentTabParamList } from '../routes';

// SUPABASE
import { supabase } from '../config/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DashboardNavProp = CompositeNavigationProp<
  MaterialTopTabNavigationProp<StudentTabParamList, 'StudentDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function StudentDashboard() {
  const navigation = useNavigation<DashboardNavProp>();

  // STANY DANYCH
  const [studentName, setStudentName] = useState<string>('Uczeń');
  const [streak, setStreak] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coins, setCoins] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [overall, setOverall] = useState<number>(0);

  // ANIMACJE
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-15)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  const gradientShift = useRef(new Animated.Value(0)).current;
  const lootboxShake = useRef(new Animated.Value(0)).current;
  const navShine = useRef(new Animated.Value(0)).current;

  // Staggered card reveal
  const cardAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const cardTranslateY = useRef([0, 1, 2, 3].map(() => new Animated.Value(30))).current;

  // Stats row animation
  const statsReveal = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(20)).current;

  // Welcome banner glow
  const welcomeGlow = useRef(new Animated.Value(0)).current;

  // FUNKCJA POBIERANIA DANYCH
  const fetchStudentData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data } = await supabase.from('students').select('*').eq('id', currentUser.id).single();

      if (data) {
        if (data.name) {
          setStudentName(data.name.split(' ')[0]);
        } else {
          setStudentName(currentUser.email?.split('@')[0] || 'Uczeń');
        }

        setStreak(data.currentStreak || 0);
        setAvatarUrl(data.avatar || null);
        setCoins(data.coins || 0);
        setLevel(data.level || 1);
        setOverall(data.overall || 0);

        if (data.testResults && data.testResults.length > 0) {
          const sortedTests = [...data.testResults]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);

          const formattedTests = sortedTests.map((test: any) => ({
            date: test.date ? new Date(test.date).toLocaleDateString('pl-PL') : 'Ostatnio',
            test: test.category || 'Test sprawnościowy',
            result: test.result || (test.sprint ? `${test.sprint}s` : 'Brak'),
            trend: test.trend || ''
          }));
          setRecentActivity(formattedTests);
        }
      }
    } catch (error) {
      console.error("Błąd pobierania danych ucznia: ", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStudentData();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
      );
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  useEffect(() => {
    // Header entrance
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerTranslateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
    ]).start();

    // Avatar spring
    Animated.spring(avatarScale, { toValue: 1, delay: 150, tension: 60, friction: 7, useNativeDriver: true }).start();

    // Flame pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Streak gradient shimmer
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientShift, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(gradientShift, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();

    // Lootbox shake
    Animated.loop(
      Animated.sequence([
        Animated.timing(lootboxShake, { toValue: 1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: -1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: 1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: -1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lootboxShake, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(2400),
      ])
    ).start();

    // Nav icon shine sweep – periodic
    Animated.loop(
      Animated.sequence([
        Animated.delay(4500),
        Animated.timing(navShine, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(navShine, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Staggered nav card reveal
    const staggerAnimations = cardAnims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 400, delay: 300 + i * 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(cardTranslateY[i], { toValue: 0, duration: 400, delay: 300 + i * 100, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      ])
    );
    Animated.parallel(staggerAnimations).start();

    // Stats reveal
    Animated.parallel([
      Animated.timing(statsReveal, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(statsTranslateY, { toValue: 0, duration: 500, delay: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    // Welcome glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(welcomeGlow, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(welcomeGlow, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    fetchStudentData();
  }, []);

  // Nav cards
  const navCards = [
    { icon: ClipboardList, iconColor: '#4FC3F7', label: 'Nowy Test', path: 'TestForm' as const },
    { icon: User, iconColor: '#AB47BC', label: 'Profil', path: 'StudentProfile' as const },
    { icon: Trophy, iconColor: '#FFD740', label: 'Ranking', path: 'RankingScreen' as const },
    { icon: MapPin, iconColor: '#66BB6A', label: 'Mapa', path: 'HeatMapScreen' as const },
  ];

  const lootboxRotate = lootboxShake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-4deg', '0deg', '4deg'],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Cześć';
    return 'Dobry wieczór';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.neonGreen} colors={[Colors.neonGreen]} />
        }
      >
        {/* ═══════ HEADER ═══════ */}
        <LinearGradient
          colors={['rgba(0, 230, 118, 0.08)', 'transparent']}
          style={styles.headerGradient}
        >
          <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
            <View style={styles.headerLeft}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.neonGreen} />
              ) : (
                <>
                  <Text style={styles.headerGreeting}>{getGreeting()},</Text>
                  <Text style={styles.headerTitle}>{studentName} 👋</Text>
                </>
              )}
            </View>

            <View style={styles.headerRight}>
              <Animated.View style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <User size={22} color={Colors.bgDeep} strokeWidth={2.5} />
                )}
              </Animated.View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <LogOut size={16} color={Colors.red} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ═══════ QUICK STATS ROW ═══════ */}
        <Animated.View style={[styles.section, { opacity: statsReveal, transform: [{ translateY: statsTranslateY }] }]}>
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatItem}>
              <LinearGradient colors={['rgba(0, 230, 118, 0.15)', 'rgba(0, 230, 118, 0.05)']} style={styles.quickStatBg}>
                <Zap size={18} color={Colors.neonGreen} strokeWidth={2.5} />
                <Text style={styles.quickStatValue}>{isLoading ? '-' : level}</Text>
                <Text style={styles.quickStatLabel}>Poziom</Text>
              </LinearGradient>
            </View>
            <View style={styles.quickStatItem}>
              <LinearGradient colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']} style={styles.quickStatBg}>
                <Star size={18} color={Colors.gold} strokeWidth={2.5} />
                <Text style={[styles.quickStatValue, { color: Colors.gold }]}>{isLoading ? '-' : coins}</Text>
                <Text style={styles.quickStatLabel}>Monety</Text>
              </LinearGradient>
            </View>
            <View style={styles.quickStatItem}>
              <LinearGradient colors={['rgba(171, 71, 188, 0.15)', 'rgba(171, 71, 188, 0.05)']} style={styles.quickStatBg}>
                <TrendingUp size={18} color="#AB47BC" strokeWidth={2.5} />
                <Text style={[styles.quickStatValue, { color: '#AB47BC' }]}>{isLoading ? '-' : overall}</Text>
                <Text style={styles.quickStatLabel}>Overall</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* ═══════ STREAK CARD ═══════ */}
        <View style={styles.section}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('StreakScreen')}>
            <LinearGradient
              colors={['#FF8C00', '#FFB300', '#FF6D00', '#FFCA28']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.streakGradientCard}
            >
              {/* Animated shimmer overlay */}
              <Animated.View
                style={[
                  styles.streakShimmer,
                  {
                    opacity: gradientShift.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.08, 0.25, 0.08],
                    }),
                  },
                ]}
              />
              <View style={styles.streakRow}>
                <View style={styles.streakLeft}>
                  <Animated.View style={[styles.flameContainer, { transform: [{ scale: flameScale }] }]}>
                    <Flame size={52} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFFBB" />
                  </Animated.View>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.streakNumber}>{streak}</Text>
                    <Text style={styles.streakLabel}>{streak === 1 ? 'dzień z rzędu' : 'dni z rzędu'}</Text>
                    <Text style={styles.streakSub}>
                      {streak > 0 ? 'Nie przerywaj! Kolejny trening przed Tobą' : 'Zacznij swoją pierwszą passę!'}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.6)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ═══════ NAV GRID ═══════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Szybki dostęp</Text>
          <View style={styles.navGrid}>
            {navCards.map((card, idx) => (
              <Animated.View
                key={card.label}
                style={[styles.navGridItem, { opacity: cardAnims[idx], transform: [{ translateY: cardTranslateY[idx] }] }]}
              >
                <NeonCard onClick={() => navigation.navigate(card.path)}>
                  <View style={styles.navCardContent}>
                    <View style={[styles.navIconWrapper, { backgroundColor: `${card.iconColor}18` }]}>
                      <card.icon size={28} color={card.iconColor} strokeWidth={2} />
                      {/* White shine sweep overlay */}
                      <Animated.View
                        style={[
                          styles.shineSweep,
                          {
                            transform: [{
                              translateX: navShine.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-80, 80],
                              }),
                            }],
                          },
                        ]}
                        pointerEvents="none"
                      >
                        <LinearGradient
                          colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.shineGradient}
                        />
                      </Animated.View>
                    </View>
                    <Text style={styles.navLabel}>{card.label}</Text>
                  </View>
                </NeonCard>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ═══════ RECENT ACTIVITY ═══════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ostatnia aktywność</Text>
            {recentActivity.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('StudentProfile')}>
                <Text style={styles.seeAllLink}>Zobacz więcej</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.activityList}>
            {recentActivity.length === 0 ? (
              <NeonCard>
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrapper}>
                    <BarChart3 size={32} color={Colors.gray} strokeWidth={1.5} />
                  </View>
                  <Text style={styles.emptyText}>Brak testów w bazie</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('TestForm')}
                    style={styles.emptyButton}
                  >
                    <Text style={styles.emptyButtonText}>Zrób swój pierwszy test!</Text>
                  </TouchableOpacity>
                </View>
              </NeonCard>
            ) : (
              recentActivity.map((activity, index) => (
                <NeonCard key={index}>
                  <View style={styles.activityRow}>
                    <View style={styles.activityIconWrap}>
                      <BarChart3 size={16} color={Colors.neonGreen} strokeWidth={2} />
                    </View>
                    <View style={styles.activityTextCol}>
                      <Text style={styles.activityTest}>{activity.test}</Text>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={styles.activityResult}>{activity.result}</Text>
                      {activity.trend ? <Text style={styles.activityTrend}>{activity.trend}</Text> : null}
                    </View>
                  </View>
                </NeonCard>
              ))
            )}
          </View>
        </View>

        {/* ═══════ MOTIVATION BANNER ═══════ */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(0, 230, 118, 0.12)', 'rgba(0, 164, 84, 0.06)']}
            style={styles.motivationBanner}
          >
            <Animated.View style={{ opacity: welcomeGlow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }}>
              <Award size={28} color={Colors.neonGreen} strokeWidth={2} />
            </Animated.View>
            <View style={styles.motivationText}>
              <Text style={styles.motivationTitle}>Cel dnia</Text>
              <Text style={styles.motivationSub}>Ukończ test i zdobądź dodatkowe monety 💰</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ═══════ LOOTBOX BANNER ═══════ */}
        <View style={styles.section}>
          <NeonCard glow>
            <View style={styles.lootboxRow}>
              <Animated.View style={{ transform: [{ rotate: lootboxRotate }] }}>
                <NeonIcon Icon={Gift} size={34} color={Colors.gold} glow />
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lootboxText}>Zdobądź Lootbox za dzisiejszy test!</Text>
                <Text style={styles.lootboxSubtext}>Każdy test to szansa na nagrodę</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.lootboxButton} onPress={() => navigation.navigate('TestForm')}>
              <Text style={styles.lootboxButtonText}>Idę trenować</Text>
              <ChevronRight size={18} color={Colors.bgDeep} />
            </TouchableOpacity>
          </NeonCard>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },

  // Header
  headerGradient: { paddingTop: 54, paddingBottom: Spacing.md },
  header: { paddingHorizontal: Spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flex: 1 },
  headerGreeting: { fontSize: FontSize.sm, color: Colors.gray, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: FontSize['2xl'], color: Colors.white, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.neonGreen, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(0, 230, 118, 0.4)',
    shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 23 },
  logoutButton: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255, 71, 87, 0.08)', borderWidth: 1, borderColor: 'rgba(255, 71, 87, 0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },

  // Quick Stats
  quickStatsRow: { flexDirection: 'row', gap: Spacing.md },
  quickStatItem: { flex: 1 },
  quickStatBg: {
    borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  quickStatValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.neonGreen, marginTop: 2 },
  quickStatLabel: { fontSize: FontSize.xs, color: Colors.gray, fontWeight: '500' },

  // Streak
  streakGradientCard: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg + 4, overflow: 'hidden',
    shadowColor: '#FF8C00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  streakShimmer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFFFFF', borderRadius: BorderRadius.lg },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, flex: 1 },
  flameContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center',
  },
  streakNumber: {
    fontSize: FontSize['5xl'], color: '#FFFFFF', fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  streakLabel: { color: '#FFFFFFEE', fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.4 },
  streakSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 4 },

  // Nav Grid
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  navGridItem: { width: (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2 },
  navCardContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg },
  navIconWrapper: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm + 2, overflow: 'hidden', position: 'relative' as const,
  },
  shineSweep: { position: 'absolute' as const, top: -4, bottom: -4, width: 28 },
  shineGradient: { flex: 1, width: '100%' },
  navLabel: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  seeAllLink: { color: Colors.neonGreen, fontSize: FontSize.xs, fontWeight: '600' },

  // Activity
  activityList: { gap: Spacing.sm },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  activityIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  activityTextCol: { flex: 1 },
  activityTest: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  activityDate: { color: Colors.gray, fontSize: FontSize.xs, marginTop: 2 },
  activityRight: { alignItems: 'flex-end' },
  activityResult: { color: Colors.neonGreen, fontSize: FontSize.lg, fontWeight: '700' },
  activityTrend: { color: Colors.gray, fontSize: FontSize.xs },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyIconWrapper: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(136, 153, 170, 0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  emptyText: { color: Colors.gray, fontSize: FontSize.sm, marginBottom: Spacing.md },
  emptyButton: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  emptyButtonText: { color: Colors.neonGreen, fontWeight: '700', fontSize: FontSize.sm },

  // Motivation
  motivationBanner: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.12)',
  },
  motivationText: { flex: 1 },
  motivationTitle: { color: Colors.neonGreen, fontWeight: '700', fontSize: FontSize.base, marginBottom: 2 },
  motivationSub: { color: Colors.gray, fontSize: FontSize.xs },

  // Lootbox
  lootboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  lootboxText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  lootboxSubtext: { color: Colors.gray, fontSize: FontSize.xs, marginTop: 2 },
  lootboxButton: {
    width: '100%', marginTop: Spacing.md, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full, backgroundColor: Colors.neonGreen,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  lootboxButtonText: { color: Colors.bgDeep, fontWeight: '700', fontSize: FontSize.base },
});
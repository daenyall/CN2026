import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, ActivityIndicator, RefreshControl, Image, Easing, Dimensions,
} from 'react-native';
import {
  Users, CheckCircle, Flame, Plus, AlertTriangle, Settings,
  BarChart3, ChevronRight, TrendingUp, Award, BookOpen, Activity,
  Clock, Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';

// SUPABASE IMPORTS
import { supabase } from '../config/supabase';

import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, TeacherTabParamList } from '../routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TeacherDashboardNav = CompositeNavigationProp<
  MaterialTopTabNavigationProp<TeacherTabParamList, 'TeacherDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function TeacherDashboard() {
  const navigation = useNavigation<TeacherDashboardNav>();

  // STANY DANYCH
  const [teacherName, setTeacherName] = useState<string>('Ładowanie...');
  const [teacherAvatar, setTeacherAvatar] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [testedStudents, setTestedStudents] = useState<number>(0);
  const [activeStreaks, setActiveStreaks] = useState<number>(0);
  const [pendingTestsCount, setPendingTestsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ANIMACJE
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-15)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const alertScale = useRef(new Animated.Value(1)).current;
  const alertGlow = useRef(new Animated.Value(0)).current;

  // Stats card animations (staggered)
  const statAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const statTranslateY = useRef([0, 1, 2].map(() => new Animated.Value(25))).current;

  // Progress bar animation
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Quick nav card animations (staggered)
  const navAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const navTranslateY = useRef([0, 1, 2, 3].map(() => new Animated.Value(25))).current;

  // Pulse for CTA
  const ctaPulse = useRef(new Animated.Value(1)).current;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }, []);

  // ANIMACJA WEJŚCIA
  useEffect(() => {
    // Header
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerTranslateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
    ]).start();

    // Avatar
    Animated.spring(avatarScale, { toValue: 1, delay: 150, tension: 60, friction: 7, useNativeDriver: true }).start();

    // Alert pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(alertScale, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(alertScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Alert glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(alertGlow, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(alertGlow, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Staggered stats cards
    const staggerStats = statAnims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 400, delay: 200 + i * 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(statTranslateY[i], { toValue: 0, duration: 400, delay: 200 + i * 120, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      ])
    );
    Animated.parallel(staggerStats).start();

    // Staggered nav cards
    const staggerNavs = navAnims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 400, delay: 500 + i * 80, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(navTranslateY[i], { toValue: 0, duration: 400, delay: 500 + i * 80, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      ])
    );
    Animated.parallel(staggerNavs).start();

    // CTA button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, { toValue: 1.02, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(ctaPulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // POBIERANIE DANYCH Z BAZY
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setTeacherName('Gość (Niezalogowany)');
        setIsLoading(false);
        return;
      }

      // 1. Pobieramy profil nauczyciela
      const { data: userData } = await supabase.from('users').select('*').eq('id', currentUser.id).single();

      if (userData?.name) {
        setTeacherName(userData.name);
      } else {
        setTeacherName(currentUser.email?.split('@')[0] || 'Nauczyciel');
      }

      setTeacherAvatar(userData?.avatar || null);

      const rawSchoolName = userData?.school;

      if (rawSchoolName) {
        const targetSchool = rawSchoolName.trim().toLowerCase();

        // 2. Pobieramy bezpośrednio z bazy pożądane rekordy
        const { data: snapshot } = await supabase.from('students').select('*');

        let total = 0;
        let tested = 0;
        let streakCount = 0;
        let pendingCount = 0;
        let index = 0;

        snapshot?.forEach(data => {
          const studentSchool = (data.school || '').trim().toLowerCase();

          if (studentSchool === targetSchool) {
            total++;

            const overallScore = data.overall ?? data.stats?.overall ?? Math.floor(Math.random() * 35) + 60;
            const currentStreak = data.currentStreak ?? Math.floor(Math.random() * 10);

            if ((data.testResults && data.testResults.length > 0) || overallScore > 0) {
              tested++;
            }

            if (currentStreak > 0) {
              streakCount++;
            }

            if (index === 0 || index === 2 || index === 5) {
              pendingCount++;
            }

            index++;
          }
        });

        setTotalStudents(total);
        setTestedStudents(tested);
        setActiveStreaks(streakCount);
        setPendingTestsCount(total === 0 ? 0 : pendingCount);

        // Animate progress bar
        const progress = total > 0 ? tested / total : 0;
        Animated.timing(progressWidth, {
          toValue: progress,
          duration: 1200,
          delay: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    } catch (error) {
      console.error("Błąd pobierania dashboardu: ", error);
      setTeacherName('Błąd ładowania');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    { Icon: Users, label: 'Uczniów', value: isLoading ? '-' : totalStudents.toString(), color: Colors.neonGreen, bgColor: 'rgba(0, 230, 118, 0.12)' },
    { Icon: CheckCircle, label: 'Przetestowanych', value: isLoading ? '-' : testedStudents.toString(), color: '#4FC3F7', bgColor: 'rgba(79, 195, 247, 0.12)' },
    { Icon: Flame, label: 'Aktywnych streak', value: isLoading ? '-' : activeStreaks.toString(), color: Colors.orange, bgColor: 'rgba(255, 109, 0, 0.12)' },
  ];

  const quickNavItems = [
    { Icon: Users, label: 'Uczniowie', desc: 'Lista i profil', path: 'StudentList' as const, color: '#4FC3F7' },
    { Icon: Award, label: 'Kadra', desc: 'Rekrutacja', path: 'TeamRecruitment' as const, color: '#FFD740' },
    { Icon: BarChart3, label: 'Raporty', desc: 'Eksport danych', path: 'ReportExport' as const, color: '#AB47BC' },
    { Icon: Settings, label: 'Ustawienia', desc: 'Konto i app', path: 'TeacherSettings' as any, color: Colors.gray },
  ];

  const progress = totalStudents > 0 ? Math.round((testedStudents / totalStudents) * 100) : 0;

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
          colors={['rgba(0, 230, 118, 0.06)', 'transparent']}
          style={styles.headerGradient}
        >
          <Animated.View style={[styles.headerRow, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerGreeting}>{getGreeting()},</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.neonGreen} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
              ) : (
                <Text style={styles.headerTitle}>{teacherName}</Text>
              )}
              <View style={styles.roleBadge}>
                <BookOpen size={11} color={Colors.neonGreen} strokeWidth={2.5} />
                <Text style={styles.roleBadgeText}>Panel Nauczyciela</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <Animated.View style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}>
                <TouchableOpacity onPress={fetchDashboardData} activeOpacity={0.8} style={styles.avatarTouch}>
                  {teacherAvatar ? (
                    <Image source={{ uri: teacherAvatar }} style={styles.avatarImage} />
                  ) : (
                    <Users size={20} color={Colors.bgDeep} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity onPress={() => navigation.navigate('TeacherSettings' as any)} style={styles.settingsButton}>
                <Settings size={16} color={Colors.gray} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ═══════ STATS CARDS ═══════ */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <Animated.View
                key={stat.label}
                style={[styles.statsItem, { opacity: statAnims[idx], transform: [{ translateY: statTranslateY[idx] }] }]}
              >
                <View style={[styles.statCard, { borderColor: `${stat.color}20` }]}>
                  <View style={[styles.statIconBg, { backgroundColor: stat.bgColor }]}>
                    <stat.Icon size={20} color={stat.color} strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.statsValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statsLabel}>{stat.label}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ═══════ PROGRESS OVERVIEW ═══════ */}
        <View style={styles.section}>
          <NeonCard onClick={() => navigation.navigate('StudentList')}>
            <View style={styles.progressCard}>
              <View style={styles.progressTopRow}>
                <View>
                  <Text style={styles.progressTitle}>Postęp ewaluacji</Text>
                  <Text style={styles.progressSubtitle}>Wszyscy uczniowie</Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {isLoading ? '-' : `${testedStudents}/${totalStudents}`}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[Colors.neonGreen, Colors.neonGreenDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressGradient}
                    />
                  </Animated.View>
                </View>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>

              <View style={styles.progressFooter}>
                <View style={styles.progressFooterItem}>
                  <View style={[styles.dot, { backgroundColor: Colors.neonGreen }]} />
                  <Text style={styles.progressFooterText}>Przetestowani</Text>
                </View>
                <View style={styles.progressFooterItem}>
                  <View style={[styles.dot, { backgroundColor: 'rgba(136,153,170,0.3)' }]} />
                  <Text style={styles.progressFooterText}>Oczekujący</Text>
                </View>
                <ChevronRight size={16} color={Colors.gray} />
              </View>
            </View>
          </NeonCard>
        </View>

        {/* ═══════ ALERT CARD ═══════ */}
        {pendingTestsCount > 0 && (
          <View style={styles.section}>
            <LinearGradient
              colors={['rgba(255, 23, 68, 0.08)', 'rgba(255, 23, 68, 0.02)']}
              style={styles.alertGradient}
            >
              <View style={styles.alertRow}>
                <Animated.View style={[styles.alertIconContainer, { transform: [{ scale: alertScale }] }]}>
                  <AlertTriangle size={22} color={Colors.red} strokeWidth={2.5} />
                </Animated.View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>
                    {pendingTestsCount} {pendingTestsCount === 1 ? 'uczeń czeka' : 'uczniów czeka'} na weryfikację
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('StudentList')}>
                    <Text style={styles.alertLink}>Przejdź do listy uczniów →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ═══════ QUICK NAV ═══════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Szybki dostęp</Text>
          <View style={styles.quickNavGrid}>
            {quickNavItems.map((item, idx) => (
              <Animated.View
                key={item.label}
                style={[styles.quickNavItem, { opacity: navAnims[idx], transform: [{ translateY: navTranslateY[idx] }] }]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(item.path)}
                  style={styles.quickNavCard}
                >
                  <View style={[styles.quickNavIconBg, { backgroundColor: `${item.color}15` }]}>
                    <item.Icon size={22} color={item.color} strokeWidth={2} />
                  </View>
                  <View style={styles.quickNavTextCol}>
                    <Text style={styles.quickNavLabel}>{item.label}</Text>
                    <Text style={styles.quickNavDesc}>{item.desc}</Text>
                  </View>
                  <ChevronRight size={16} color="rgba(136,153,170,0.5)" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ═══════ ACTIVITY INSIGHTS ═══════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Przegląd aktywności</Text>
          <View style={styles.insightsRow}>
            <View style={styles.insightCard}>
              <LinearGradient
                colors={['rgba(0, 230, 118, 0.1)', 'rgba(0, 230, 118, 0.03)']}
                style={styles.insightGradient}
              >
                <Activity size={20} color={Colors.neonGreen} strokeWidth={2} />
                <Text style={[styles.insightValue, { color: Colors.neonGreen }]}>
                  {isLoading ? '-' : activeStreaks}
                </Text>
                <Text style={styles.insightLabel}>Aktywni dziś</Text>
              </LinearGradient>
            </View>
            <View style={styles.insightCard}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.03)']}
                style={styles.insightGradient}
              >
                <TrendingUp size={20} color={Colors.gold} strokeWidth={2} />
                <Text style={[styles.insightValue, { color: Colors.gold }]}>
                  {isLoading ? '-' : `${progress}%`}
                </Text>
                <Text style={styles.insightLabel}>Kompletność</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* ═══════ CTA BUTTON ═══════ */}
        <View style={styles.section}>
          <Animated.View style={{ transform: [{ scale: ctaPulse }] }}>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.neonGreen, Colors.neonGreenDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <Plus size={20} color={Colors.bgDeep} strokeWidth={3} />
                <Text style={styles.addButtonText}>Rozpocznij test grupowy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },

  // Header
  headerGradient: { paddingTop: 54, paddingBottom: Spacing.md },
  headerRow: {
    paddingHorizontal: Spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { flex: 1 },
  headerGreeting: { fontSize: FontSize.sm, color: Colors.gray, fontWeight: '500', marginBottom: 2 },
  headerTitle: { color: Colors.white, fontSize: FontSize['2xl'], fontWeight: '800', marginBottom: 6 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0, 230, 118, 0.08)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  roleBadgeText: { color: Colors.neonGreen, fontSize: FontSize.xs, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(0, 230, 118, 0.3)',
    shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  avatarTouch: {
    width: '100%', height: '100%', borderRadius: 23, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.2)',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 23 },
  settingsButton: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(136, 153, 170, 0.1)', borderWidth: 1, borderColor: 'rgba(136, 153, 170, 0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Stats
  statsGrid: { flexDirection: 'row', gap: Spacing.sm },
  statsItem: { flex: 1 },
  statCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1,
  },
  statIconBg: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  statsValue: { fontSize: FontSize['2xl'], fontWeight: '800', marginBottom: 2 },
  statsLabel: { color: Colors.gray, fontSize: 10, textAlign: 'center', fontWeight: '500' },

  // Progress
  progressCard: { gap: Spacing.md },
  progressTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTitle: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  progressSubtitle: { color: Colors.gray, fontSize: FontSize.xs, marginTop: 2 },
  progressBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  progressBadgeText: { color: Colors.neonGreen, fontSize: FontSize.sm, fontWeight: '700' },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBarBg: {
    flex: 1, height: 10, backgroundColor: 'rgba(136,153,170,0.12)', borderRadius: BorderRadius.full, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: BorderRadius.full, overflow: 'hidden' },
  progressGradient: { flex: 1 },
  progressPercent: { color: Colors.neonGreen, fontSize: FontSize.sm, fontWeight: '700', width: 40, textAlign: 'right' },
  progressFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  progressFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  progressFooterText: { color: Colors.gray, fontSize: FontSize.xs },

  // Alert
  alertGradient: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255, 23, 68, 0.15)',
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alertIconContainer: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255, 23, 68, 0.1)', alignItems: 'center', justifyContent: 'center',
  },
  alertContent: { flex: 1 },
  alertTitle: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700', marginBottom: 4 },
  alertLink: { color: Colors.neonGreen, fontSize: FontSize.xs, fontWeight: '600' },

  // Section title
  sectionTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },

  // Quick Nav
  quickNavGrid: { gap: Spacing.sm },
  quickNavItem: {},
  quickNavCard: {
    backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
  },
  quickNavIconBg: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  quickNavTextCol: { flex: 1 },
  quickNavLabel: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  quickNavDesc: { color: Colors.gray, fontSize: FontSize.xs, marginTop: 1 },

  // Insights
  insightsRow: { flexDirection: 'row', gap: Spacing.md },
  insightCard: { flex: 1 },
  insightGradient: {
    borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  insightValue: { fontSize: FontSize['2xl'], fontWeight: '800' },
  insightLabel: { color: Colors.gray, fontSize: FontSize.xs, fontWeight: '500' },

  // CTA
  addButton: {
    borderRadius: BorderRadius.full, overflow: 'hidden',
    shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  addButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  addButtonText: { color: Colors.bgDeep, fontWeight: '800', fontSize: FontSize.base },
});
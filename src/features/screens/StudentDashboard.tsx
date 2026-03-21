import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { BarChart3, Play, Trophy, Map, Flame, Gift, LogOut } from 'lucide-react-native';
import { useNavigation, CompositeNavigationProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, StudentTabParamList } from '../routes';

// FIREBASE
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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

  // ANIMACJE
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateX = useRef(new Animated.Value(-20)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;

  // FUNKCJA POBIERANIA DANYCH
  const fetchStudentData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const studentDoc = await getDoc(doc(db, 'students', currentUser.uid));

      if (studentDoc.exists()) {
        const data = studentDoc.data();

        // Imię
        if (data.name) {
          setStudentName(data.name.split(' ')[0]);
        } else {
          setStudentName(currentUser.email?.split('@')[0] || 'Uczeń');
        }

        setStreak(data.currentStreak || 0);
        setAvatarUrl(data.avatar || null);

        // Ostatnia aktywność (mapowanie wyników)
        if (data.testResults && data.testResults.length > 0) {
          const sortedTests = [...data.testResults]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
      );
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  useEffect(() => {
    // Start animacji
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

    fetchStudentData();
  }, []);

  const navCards = [
    { emoji: '📝', label: 'Nowy Test', path: 'TestForm' as const },
    { emoji: '👤', label: 'Profil', path: 'StudentProfile' as const },
    { emoji: '🏆', label: 'Ranking', path: 'RankingScreen' as const },
    { emoji: '🗺️', label: 'Mapa', path: 'HeatMapScreen' as const },
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
          <Animated.View style={{ opacity: headerOpacity, transform: [{ translateX: headerTranslateX }] }}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.neonGreen} />
            ) : (
              <Text style={styles.headerTitle}>Cześć, {studentName}! 👋</Text>
            )}
          </Animated.View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Animated.View style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
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
                  <Text style={styles.streakNumber}>{streak}</Text>
                  <Text style={styles.streakLabel}>{streak === 1 ? 'dzień z rzędu' : 'dni z rzędu'}</Text>
                  <Text style={styles.streakSub}>
                    {streak > 0 ? 'Nie przerywaj! Kolejny trening przed Tobą' : 'Zacznij swoją pierwszą passę!'}
                  </Text>
                </View>
              </View>
            </View>
          </NeonCard>
        </View>

        {/* Nav Grid */}
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
            {recentActivity.length === 0 ? (
              <NeonCard>
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ color: Colors.gray, fontSize: FontSize.sm }}>Brak testów w bazie.</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('TestForm')}>
                    <Text style={{ color: Colors.neonGreen, fontWeight: 'bold', marginTop: 8 }}>Zrób swój pierwszy test!</Text>
                  </TouchableOpacity>
                </View>
              </NeonCard>
            ) : (
              recentActivity.map((activity, index) => (
                <NeonCard key={index}>
                  <View style={styles.activityRow}>
                    <View>
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

        {/* Lootbox Banner */}
        <View style={styles.section}>
          <NeonCard glow>
            <View style={styles.lootboxRow}>
              <NeonIcon Icon={Gift} size={32} color={Colors.gold} glow />
              <View style={{ flex: 1 }}>
                <Text style={styles.lootboxText}>🎁 Zdobądź Lootbox za dzisiejszy test!</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.lootboxButton} onPress={() => navigation.navigate('TestForm')}>
              <Text style={styles.lootboxButtonText}>Idę trenować</Text>
            </TouchableOpacity>
          </NeonCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  header: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: FontSize['2xl'], color: Colors.white, fontWeight: '700' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.neonGreen, overflow: 'hidden' },
  avatarText: { fontSize: 20 },
  logoutButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 71, 87, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 71, 87, 0.3)', alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  streakNumber: { fontSize: FontSize['6xl'], color: Colors.orange, fontWeight: '800' },
  streakLabel: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  streakSub: { color: Colors.gray, fontSize: FontSize.xs, marginTop: 4 },
  navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  navGridItem: { width: '47%' },
  navCardContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg },
  navEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  navLabel: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  activityList: { gap: Spacing.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityTest: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  activityDate: { color: Colors.gray, fontSize: FontSize.xs },
  activityRight: { alignItems: 'flex-end' },
  activityResult: { color: Colors.neonGreen, fontSize: FontSize.lg, fontWeight: '700' },
  activityTrend: { color: Colors.gray, fontSize: FontSize.xs },
  lootboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  lootboxText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  lootboxButton: { width: '100%', marginTop: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.neonGreen, alignItems: 'center' },
  lootboxButtonText: { color: Colors.bgDeep, fontWeight: '700', fontSize: FontSize.base },
});
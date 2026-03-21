import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import StudentProfile from './StudentProfile';
import { Flame, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Clock, School } from 'lucide-react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, TeacherTabParamList } from '../routes';

type StudentListNav = CompositeNavigationProp<
  MaterialTopTabNavigationProp<TeacherTabParamList, 'StudentList'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function StudentList() {
  const navigation = useNavigation<StudentListNav>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'best' | 'streak' | 'inactive'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // STANY DLA DANYCH Z FIREBASE
  const [firebaseStudents, setFirebaseStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherSchoolName, setTeacherSchoolName] = useState<string>('Wczytywanie placówki...');

  // POBIERANIE DANYCH Z FIREBASE TYLKO DLA SZKOŁY NAUCZYCIELA
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        // 1. Pobieramy profil nauczyciela, żeby sprawdzić, do jakiej szkoły uczy
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const schoolName = userDoc.data()?.school;

        if (!schoolName) {
          setTeacherSchoolName("Brak przypisanej placówki");
          setIsLoading(false);
          return;
        }

        // Ustawiamy nazwę szkoły do wyświetlenia w nagłówku
        setTeacherSchoolName(schoolName);

        // 2. Pobieramy z Firestore TYLKO uczniów z tej samej placówki!
        const q = query(collection(db, 'students'), where('school', '==', schoolName));
        const querySnapshot = await getDocs(q);

        const fetchedData = querySnapshot.docs.map(document => ({
          id: document.id,
          ...document.data()
        }));

        setFirebaseStudents(fetchedData);
      } catch (error) {
        console.error("Błąd pobierania uczniów z Firebase: ", error);
        setTeacherSchoolName("Błąd połączenia z bazą");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Mapowanie pobranych danych (odpowiednik wcześniejszego MOCK_STUDENTS)
  const students = firebaseStudents.map((athlete, index) => {
    // Zabezpieczenie, bo w Firebase mogło to zostać zapisane jako stats.overall albo po prostu overall
    const overallScore = athlete.overall ?? athlete.stats?.overall ?? 0;

    const isActive = (athlete.currentStreak || 0) > 0;
    let trend: 'up' | 'down' | 'same' = 'same';
    if (overallScore >= 75) trend = 'up';
    else if (overallScore < 60) trend = 'down';

    return {
      id: athlete.id,
      name: athlete.name || 'Nieznany Uczeń',
      number: index + 1,
      score: overallScore,
      streak: athlete.currentStreak || 0,
      trend,
      active: isActive,
      class: athlete.class || 'Brak danych',
      // Symulujemy, że niektórzy uczniowie (np. pierwszy, trzeci) mają testy do zatwierdzenia na potrzeby dema
      hasPendingTests: index === 0 || index === 2 || index === 5,
    };
  });

  const filters = [
    { id: 'all' as const, label: 'Wszyscy' },
    { id: 'best' as const, label: 'Najlepsi' },
    { id: 'streak' as const, label: 'Streak' },
    { id: 'inactive' as const, label: 'Brak aktywności' },
    { id: 'pending' as const, label: 'Do zatwierdzenia' },
  ];

  const filteredStudents = students
    .filter((student) => {
      if (activeFilter === 'best') return student.score >= 75;
      if (activeFilter === 'streak') return student.streak >= 7;
      if (activeFilter === 'inactive') return !student.active;
      if (activeFilter === 'pending') return student.hasPendingTests;
      return true;
    })
    .sort((a, b) => {
      if (activeFilter === 'best') {
        return b.score - a.score;
      }
      if (activeFilter === 'streak') {
        return b.streak - a.streak;
      }
      if (activeFilter === 'pending' || activeFilter === 'inactive' || activeFilter === 'all') {
        const nazwiskoA = a.name.split(' ').slice(1).join(' ') || a.name;
        const nazwiskoB = b.name.split(' ').slice(1).join(' ') || b.name;
        return nazwiskoA.localeCompare(nazwiskoB);
      }
      return 0;
    });

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) {
      return {
        bg: { backgroundColor: Colors.gold },
        shadow: { shadowColor: Colors.gold, shadowOpacity: 0.5, shadowRadius: 6, elevation: 5 },
        text: { color: Colors.bgDeep },
      };
    }
    if (score >= 65) {
      return {
        bg: { backgroundColor: Colors.neonGreen },
        shadow: { shadowColor: Colors.neonGreen, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
        text: { color: Colors.bgDeep },
      };
    }
    return {
      bg: { backgroundColor: Colors.bgDeep },
      shadow: {},
      text: { color: Colors.neonGreen },
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>

          {/* Header - Teraz dynamiczny! */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
                {teacherSchoolName}
              </Text>
              <View style={styles.headerSubtitleRow}>
                <School size={14} color={Colors.gray} />
                <Text style={styles.headerSubtitle}>Twój Panel Placówki</Text>
              </View>
            </View>

            <View style={styles.headerBadge}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.neonGreen} />
              ) : (
                <Text style={styles.headerBadgeText}>{students.length}</Text>
              )}
            </View>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            <View style={styles.filtersRow}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    activeFilter === filter.id ? styles.filterButtonActive : styles.filterButtonInactive,
                    filter.id === 'pending' && activeFilter !== 'pending' && styles.filterButtonPending,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(filter.id)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.id ? styles.filterTextActive : styles.filterTextInactive,
                      filter.id === 'pending' && activeFilter !== 'pending' && { color: Colors.orange },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Students List */}
          <View style={styles.studentsList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.neonGreen} />
                <Text style={styles.loadingText}>Ładowanie danych ze szkoły...</Text>
              </View>
            ) : filteredStudents.length === 0 ? (
              <Text style={{ color: Colors.gray, textAlign: 'center', marginTop: 20 }}>
                Brak uczniów przypisanych do tej placówki. 🎉
              </Text>
            ) : filteredStudents.map((student) => {
              const scoreStyle = getScoreBadgeStyle(student.score);

              return (
                <NeonCard
                  key={student.number}
                  onClick={() => setSelectedStudentId(student.id)}
                  style={!student.active ? styles.inactiveCard : undefined}
                >
                  <View style={styles.studentRow}>
                    {/* Avatar */}
                    <View
                      style={[
                        styles.studentAvatar,
                        !student.active && { opacity: 0.5 },
                      ]}
                    >
                      <Text style={{ fontSize: 18 }}>👤</Text>
                      <View style={styles.studentNumber}>
                        <Text style={styles.studentNumberText}>{student.number}</Text>
                      </View>
                    </View>

                    {/* Info */}
                    <View style={styles.studentInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.studentName} numberOfLines={1}>
                          {student.name}
                        </Text>
                        {/* Pomarańczowa odznaka pending testu */}
                        {student.hasPendingTests && (
                          <View style={styles.pendingBadge}>
                            <Clock size={10} color={Colors.bgDeep} />
                            <Text style={styles.pendingBadgeText}>Do oceny</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.studentMeta}>
                        <Text style={styles.studentClass}>Klasa {student.class}</Text>
                        {student.streak >= 7 && student.active && (
                          <View style={styles.streakBadge}>
                            <Flame size={12} color={Colors.orange} />
                            <Text style={styles.streakBadgeText}>{student.streak}</Text>
                          </View>
                        )}
                        {!student.active && (
                          <View style={styles.inactiveBadge}>
                            <AlertTriangle size={12} color={Colors.red} />
                            <Text style={styles.inactiveBadgeText}>Brak aktywności</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Score Badge */}
                    <View
                      style={[
                        styles.scoreBadge,
                        scoreStyle.bg,
                        scoreStyle.shadow,
                      ]}
                    >
                      <Text style={[styles.scoreText, scoreStyle.text]}>{student.score}</Text>
                    </View>

                    {/* Trend */}
                    <View style={styles.trendArea}>
                      {student.trend === 'up' && <TrendingUp size={18} color={Colors.neonGreen} />}
                      {student.trend === 'down' && <TrendingDown size={18} color={Colors.red} />}
                      <ChevronRight size={20} color={Colors.gray} />
                    </View>
                  </View>
                </NeonCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Student Profile Modal */}
      <Modal
        visible={selectedStudentId !== null}
        animationType="slide"
        presentationStyle="fullScreen"
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
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  innerPadding: { padding: Spacing.xl, paddingTop: 60 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  headerTitle: { color: Colors.white, fontSize: FontSize['xl'], fontWeight: '800' },
  headerSubtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  headerSubtitle: { color: Colors.gray, fontSize: FontSize.xs, fontWeight: '600' },
  headerBadge: { paddingHorizontal: Spacing.lg, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)', minWidth: 45, alignItems: 'center' },
  headerBadgeText: { color: Colors.neonGreen, fontWeight: '700', fontSize: FontSize.base },

  loadingContainer: { marginTop: 60, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Colors.gray, marginTop: 12, fontSize: FontSize.sm, fontWeight: '500' },

  filtersScroll: { marginBottom: Spacing.xl },
  filtersRow: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.sm },
  filterButton: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  filterButtonActive: { backgroundColor: Colors.neonGreen },
  filterButtonInactive: { backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)' },
  filterButtonPending: { borderColor: Colors.orange, borderWidth: 1 },
  filterText: { fontSize: FontSize.sm, fontWeight: '600' },
  filterTextActive: { color: Colors.bgDeep },
  filterTextInactive: { color: Colors.gray },
  studentsList: { gap: Spacing.md },
  inactiveCard: { borderLeftWidth: 4, borderLeftColor: Colors.red },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 4 },
  studentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.neonGreen, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  studentNumber: { position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center' },
  studentNumberText: { color: Colors.neonGreen, fontSize: FontSize.xs, fontWeight: '700' },
  studentInfo: { flex: 1, minWidth: 0 },
  studentName: { color: Colors.white, fontWeight: '700', fontSize: FontSize.base },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.orange, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, gap: 2 },
  pendingBadgeText: { color: Colors.bgDeep, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  studentMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  studentClass: { color: Colors.gray, fontSize: FontSize.xs },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  streakBadgeText: { color: Colors.orange, fontSize: FontSize.xs },
  inactiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  inactiveBadgeText: { color: Colors.red, fontSize: FontSize.xs },
  scoreBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full },
  scoreText: { fontWeight: '800', fontSize: FontSize.base },
  trendArea: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
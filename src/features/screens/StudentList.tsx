import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Flame, TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NeonCard } from '../components/NeonCard';
import { BottomNav } from '../components/BottomNav';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList } from '../routes';
import { MOCK_STUDENTS } from '../data/MockStudents';

export default function StudentList() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'best' | 'streak' | 'inactive'>('all');

  const students = [
    { name: 'Jakub Kowalski', number: 1, score: 87, streak: 12, trend: 'up', active: true },
    { name: 'Anna Nowak', number: 2, score: 89, streak: 8, trend: 'up', active: true },
    { name: 'Michał Wiśniewski', number: 3, score: 85, streak: 15, trend: 'same', active: true },
    { name: 'Zofia Lewandowska', number: 4, score: 82, streak: 0, trend: 'down', active: false },
    { name: 'Kacper Zieliński', number: 5, score: 88, streak: 10, trend: 'up', active: true },
    { name: 'Julia Kamińska', number: 6, score: 84, streak: 3, trend: 'same', active: true },
    { name: 'Filip Dąbrowski', number: 7, score: 79, streak: 0, trend: 'down', active: false },
    { name: 'Maja Piotrowska', number: 8, score: 86, streak: 7, trend: 'up', active: true },
    { name: 'Adam Kowalczyk', number: 9, score: 81, streak: 9, trend: 'up', active: true },
    { name: 'Oliwia Szymańska', number: 10, score: 83, streak: 4, trend: 'same', active: true },
  ];

  const filters = [
    { id: 'all' as const, label: 'Wszyscy' },
    { id: 'best' as const, label: 'Najlepsi' },
    { id: 'streak' as const, label: 'Streak' },
    { id: 'inactive' as const, label: 'Brak aktywności' },
  ];

  const filteredStudents = students.filter((student) => {
    if (activeFilter === 'best') return student.score >= 85;
    if (activeFilter === 'streak') return student.streak >= 7;
    if (activeFilter === 'inactive') return !student.active;
    return true;
  });

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 85) {
      return {
        bg: { backgroundColor: Colors.gold },
        shadow: { shadowColor: Colors.gold, shadowOpacity: 0.5, shadowRadius: 6, elevation: 5 },
        text: { color: Colors.bgDeep },
      };
    }
    if (score >= 80) {
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
  console.log("Ilu mamy uczniów w bazie?", MOCK_STUDENTS.length);
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Klasa 6A</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>24</Text>
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
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(filter.id)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.id ? styles.filterTextActive : styles.filterTextInactive,
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
            {filteredStudents.map((student) => {
              const scoreStyle = getScoreBadgeStyle(student.score);

              return (
                <NeonCard
                  key={student.number}
                  onClick={() => navigation.navigate('StudentProfile')}
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
                      <Text style={styles.studentName} numberOfLines={1}>
                        {student.name}
                      </Text>
                      <View style={styles.studentMeta}>
                        <Text style={styles.studentClass}>#{student.number} w klasie</Text>
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

      <BottomNav type="teacher" />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  headerBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  headerBadgeText: {
    color: Colors.neonGreen,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
  filtersScroll: {
    marginBottom: Spacing.xl,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterButtonActive: {
    backgroundColor: Colors.neonGreen,
  },
  filterButtonInactive: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.bgDeep,
  },
  filterTextInactive: {
    color: Colors.gray,
  },
  studentsList: {
    gap: Spacing.md,
  },
  inactiveCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.red,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 4,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  studentNumber: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentNumberText: {
    color: Colors.neonGreen,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  studentClass: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakBadgeText: {
    color: Colors.orange,
    fontSize: FontSize.xs,
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inactiveBadgeText: {
    color: Colors.red,
    fontSize: FontSize.xs,
  },
  scoreBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  scoreText: {
    fontWeight: '800',
    fontSize: FontSize.base,
  },
  trendArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});

import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Users, CheckCircle, Flame, Plus, AlertTriangle } from 'lucide-react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';

import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, TeacherTabParamList } from '../routes';

type TeacherDashboardNav = CompositeNavigationProp<
  MaterialTopTabNavigationProp<TeacherTabParamList, 'TeacherDashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function TeacherDashboard() {
  const navigation = useNavigation<TeacherDashboardNav>();
  const alertScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(alertScale, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(alertScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const stats = [
    { Icon: Users, label: 'Uczniów', value: '47', color: Colors.neonGreen },
    { Icon: CheckCircle, label: 'Przetestowanych', value: '38', color: Colors.neonGreen },
    { Icon: Flame, label: 'Aktywnych streak', value: '21', color: Colors.orange },
  ];

  const classes = [
    { name: '6A', students: 24, tested: 20, progress: 83 },
    { name: '6B', students: 23, tested: 18, progress: 78 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Panel Nauczyciela</Text>
              <Text style={styles.headerSub}>mgr Anna Nowak</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 20 }}>👩‍🏫</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statsItem}>
                <NeonCard>
                  <View style={styles.statsContent}>
                    <NeonIcon Icon={stat.Icon} size={24} color={stat.color} glow />
                    <Text style={[styles.statsValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={styles.statsLabel}>{stat.label}</Text>
                  </View>
                </NeonCard>
              </View>
            ))}
          </View>

          {/* Classes */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>Twoje klasy</Text>
            <View style={styles.classesList}>
              {classes.map((classItem, index) => (
                <NeonCard
                  key={classItem.name}
                  onClick={() => navigation.navigate('StudentList')}
                >
                  <View style={styles.classContent}>
                    <View style={styles.classHeader}>
                      <View>
                        <Text style={styles.className}>Klasa {classItem.name}</Text>
                        <Text style={styles.classStudents}>{classItem.students} uczniów</Text>
                      </View>
                      <View style={styles.classRight}>
                        <Text style={styles.classTested}>
                          {classItem.tested}/{classItem.students}
                        </Text>
                        <Text style={styles.classTestedLabel}>przetestowanych</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Postęp testów</Text>
                        <Text style={styles.progressPercent}>{classItem.progress}%</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <Animated.View
                          style={[
                            styles.progressBarFill,
                            { width: `${classItem.progress}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </NeonCard>
              ))}
            </View>
          </View>

          {/* Alert Card */}
          <View style={styles.sectionSpacing}>
            <NeonCard>
              <View style={styles.alertCard}>
                <View style={styles.alertRow}>
                  <Animated.View style={{ transform: [{ scale: alertScale }] }}>
                    <NeonIcon Icon={AlertTriangle} size={24} color={Colors.red} glow />
                  </Animated.View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertText}>
                      ⚠️ 9 uczniów nie robiło testu ponad 2 tygodnie
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('StudentList')}>
                      <Text style={styles.alertLink}>Zobacz →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </NeonCard>
          </View>

          {/* Add Test Button */}
          <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
            <Plus size={20} color={Colors.bgDeep} />
            <Text style={styles.addButtonText}>Dodaj nowy test dla klasy</Text>
          </TouchableOpacity>
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
    marginBottom: 4,
  },
  headerSub: {
    color: Colors.gray,
    fontSize: FontSize.base,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statsItem: {
    flex: 1,
  },
  statsContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statsValue: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  statsLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  sectionSpacing: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  classesList: {
    gap: Spacing.md,
  },
  classContent: {
    gap: Spacing.md,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  className: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  classStudents: {
    color: Colors.gray,
    fontSize: FontSize.sm,
  },
  classRight: {
    alignItems: 'flex-end',
  },
  classTested: {
    color: Colors.neonGreen,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  classTestedLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  progressPercent: {
    color: Colors.neonGreen,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.bgDeep,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
  },
  alertCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.red,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  alertLink: {
    color: Colors.neonGreen,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  addButtonText: {
    color: Colors.bgDeep,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
});

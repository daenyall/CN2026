import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Users, CheckCircle, Flame, Plus, AlertTriangle } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';
import { NeonIcon } from '../../components/NeonIcon';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export default function TeacherDashboard() {
  const navigation = useNavigation<any>();

  const stats = [
    { icon: Users, label: "Uczniów", value: "47", color: "#00E676" },
    { icon: CheckCircle, label: "Przetestowanych", value: "38", color: "#00E676" },
    { icon: Flame, label: "Aktywnych streak", value: "21", color: "#FF6D00" },
  ];

  const classes = [
    { name: "6A", students: 24, tested: 20, progress: 83 },
    { name: "6B", students: 23, tested: 18, progress: 78 },
  ];

  const alertScale = useSharedValue(1);

  useEffect(() => {
    alertScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const alertAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: alertScale.value }]
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Animated.Text entering={FadeInDown} style={styles.title}>
            Panel Nauczyciela
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(100)} style={styles.subtitle}>
            mgr Anna Nowak
          </Animated.Text>
        </View>
        <Animated.View entering={ZoomIn.delay(200)} style={styles.avatarContainer}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#00E676" />
                <Stop offset="1" stopColor="#00A854" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#avatarGrad)" rx="24" />
          </Svg>
          <Text style={styles.avatarEmoji}>👩‍🏫</Text>
        </Animated.View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Animated.View key={stat.label} entering={FadeInDown.delay(100 * index)} style={styles.statCell}>
            <NeonCard>
              <View style={styles.statContent}>
                <NeonIcon Icon={stat.icon} size={24} color={stat.color} glow={true} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </NeonCard>
          </Animated.View>
        ))}
      </View>

      {/* Classes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Twoje klasy</Text>
        <View style={styles.classesList}>
          {classes.map((classItem, index) => (
            <Animated.View key={classItem.name} entering={FadeInDown.delay(300 + index * 100)}>
              <NeonCard onClick={() => navigation.navigate("ClassListScreen")}>
                <View style={styles.classCardContent}>
                  <View style={styles.classCardHeader}>
                    <View>
                      <Text style={styles.className}>Klasa {classItem.name}</Text>
                      <Text style={styles.classStudents}>{classItem.students} uczniów</Text>
                    </View>
                    <View style={styles.classTestedBox}>
                      <Text style={styles.classTestedValue}>{classItem.tested}/{classItem.students}</Text>
                      <Text style={styles.classTestedLabel}>przetestowanych</Text>
                    </View>
                  </View>
                  
                  <View>
                    <View style={styles.progressHeader}>
                      <Text style={styles.classTestedLabel}>Postęp testów</Text>
                      <Text style={styles.progressText}>{classItem.progress}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <Animated.View entering={ZoomIn.delay(500 + index * 100)} style={[styles.progressBarFill, { width: `${classItem.progress}%` }]}>
                        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                          <Defs>
                            <LinearGradient id={`progGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                              <Stop offset="0" stopColor="#00E676" />
                              <Stop offset="1" stopColor="#00A854" />
                            </LinearGradient>
                          </Defs>
                          <Rect width="100%" height="100%" fill={`url(#progGrad-${index})`} />
                        </Svg>
                      </Animated.View>
                    </View>
                  </View>
                </View>
              </NeonCard>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Alert Card */}
      <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
        <NeonCard>
          <View style={styles.alertContent}>
            <View style={StyleSheet.absoluteFillObject}>
              <Svg height="100%" width="100%">
                <Defs>
                  <LinearGradient id="alertGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="rgba(255, 23, 68, 0.1)" />
                    <Stop offset="1" stopColor="transparent" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#alertGrad)" />
              </Svg>
            </View>
            <View style={styles.alertRow}>
              <Animated.View style={alertAnimatedStyle}>
                <NeonIcon Icon={AlertTriangle} size={24} color="#FF1744" glow={true} />
              </Animated.View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertText}>⚠️ 9 uczniów nie robiło testu ponad 2 tygodnie</Text>
                <TouchableOpacity onPress={() => navigation.navigate("ClassListScreen")}>
                  <Text style={styles.alertLink}>Zobacz →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </NeonCard>
      </Animated.View>

      {/* Add Test Button */}
      <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
        <TouchableOpacity activeOpacity={0.8} style={styles.addTestBtn}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#00E676" />
                <Stop offset="1" stopColor="#00A854" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#btnGrad)" rx="28" />
          </Svg>
          <Plus size={20} color="#0A0E1A" />
          <Text style={styles.addTestText}>Dodaj nowy test dla klasy</Text>
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
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#8899AA',
    fontSize: 14,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCell: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#8899AA',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  classesList: {
    gap: 12,
  },
  classCardContent: {
    gap: 12,
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  className: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  classStudents: {
    color: '#8899AA',
    fontSize: 14,
  },
  classTestedBox: {
    alignItems: 'flex-end',
  },
  classTestedValue: {
    color: '#00E676',
    fontSize: 20,
    fontWeight: '800',
  },
  classTestedLabel: {
    color: '#8899AA',
    fontSize: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: '#00E676',
    fontWeight: '700',
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#0A0E1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  alertContent: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF1744',
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    zIndex: 2,
  },
  alertInfo: {
    flex: 1,
  },
  alertText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  alertLink: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
  addTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  addTestText: {
    color: '#0A0E1A',
    fontWeight: '700',
    fontSize: 16,
    zIndex: 2,
  }
});

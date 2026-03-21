import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Alert, Modal, TextInput, Dimensions, Image, RefreshControl } from 'react-native';
import { Download, Flame, CheckCircle, XCircle, ArrowLeft, Settings, X } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import Svg, { Polygon, Circle as SvgCircle, Text as SvgText, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LineChart } from 'react-native-chart-kit';

import { MOCK_STUDENTS, Athlete } from '../data/MockStudents';

interface StudentProfileProps {
  studentId?: string;
  onClose?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

// Funkcja Helper do BMI
const getBMITheme = (weight: number, height: number) => {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  if (bmi < 18.5) return '#00C6FF';          // Niedowaga
  if (bmi >= 18.5 && bmi < 25) return Colors.neonGreen; // Norma
  if (bmi >= 25 && bmi < 30) return Colors.orange;     // Nadwaga
  return Colors.red;                           // Otyłość
};

// Radar Chart
function RadarChart({ data, size = 320, themeColor = Colors.neonGreen }: { data: { attribute: string; value: number }[]; size?: number; themeColor?: string }) {
  const center = size / 2;
  const radius = 105;
  const bgRadius = 155; // Idealnie okrągłe, znacznie szersze tło na całą pajęczynę
  const angleStep = (2 * Math.PI) / data.length;
  const levels = 5;

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = data.map((d, i) => getPoint(d.value, i));
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor={themeColor} stopOpacity="0.10" />
          <Stop offset="100%" stopColor={Colors.bgDeep} stopOpacity="0.9" />
        </RadialGradient>
      </Defs>

      {/* Idealnie okrągłe tło pod wykresem */}
      <SvgCircle cx={center} cy={center} r={bgRadius} fill="url(#grad)" />

      {/* Siatka */}
      {Array.from({ length: levels }, (_, level) => {
        const r = (radius / levels) * (level + 1);
        const points = data
          .map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          })
          .join(' ');
        return <Polygon key={level} points={points} fill="none" stroke={Colors.gray} strokeWidth={1} opacity={0.4} />;
      })}

      {/* Osie wykresu */}
      {data.map((_, i) => {
        const endPoint = getPoint(100, i);
        return (
          <Line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke={Colors.gray}
            strokeWidth={1}
            opacity={0.4}
          />
        );
      })}

      {/* Wypełnienie poligonu gracza */}
      <Polygon
        points={polygonPoints}
        fill={themeColor}
        fillOpacity={0.4}
        stroke={themeColor}
        strokeWidth={3}
      />

      {dataPoints.map((p, i) => (
        <SvgCircle key={`dot-${i}`} cx={p.x} cy={p.y} r={5} fill={themeColor} />
      ))}

      {/* Labele tekstów dopasowane do środka */}
      {data.map((d, i) => {
        const labelPoint = getPoint(135, i);
        return (
          <SvgText
            key={`label-${i}`}
            x={labelPoint.x}
            y={labelPoint.y}
            fill={Colors.white}
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {d.attribute}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// Logika PDF
const generatePDF = async (student: Athlete, streak: number) => {
  try {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #00E676; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #0A0E1A; }
            .header p { margin: 5px 0; color: #666; }
            .section { margin-bottom: 20px; }
            .section h2 { color: #00E676; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .stat-box { background: #f5f5f5; padding: 10px; border-radius: 5px; text-align: center; }
            .stat-box strong { display: block; font-size: 20px; color: #0A0E1A; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Paszport Sportowy</h1>
            <h2>${student.name}</h2>
            <p>Wiek: ${student.age} | ${student.class}</p>
            <p><strong>Overall: ${student.overall}</strong></p>
            <p>Aktualny Streak: ${streak} dni</p>
          </div>

          <div class="section">
            <h2>Statystyki Główne</h2>
            <div class="stats-grid">
              <div class="stat-box">Szybkość: <strong>${student.stats.speed}</strong></div>
              <div class="stat-box">Siła: <strong>${student.stats.strength}</strong></div>
              <div class="stat-box">Wytrzymałość: <strong>${student.stats.stamina}</strong></div>
              <div class="stat-box">Skoczność: <strong>${student.stats.jump}</strong></div>
              <div class="stat-box">Zwinność: <strong>${student.stats.agility}</strong></div>
            </div>
          </div>

          <div class="section">
            <h2>Ostatnie Osiągnięcia</h2>
            <ul>
              ${student.recentAchievements.map((a: any) => `<li>${a.icon} ${a.title}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h2>Ostatnie Ćwiczenia</h2>
            <table>
              <tr><th>Ćwiczenie</th><th>Data</th><th>Wynik</th></tr>
              ${student.recentExercises.map((e: any) => `
                <tr>
                  <td>${e.name}</td>
                  <td>${new Date(e.date).toLocaleDateString()}</td>
                  <td>${e.score}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  } catch (error) {
    Alert.alert('Błąd', 'Nie udało się wygenerować PDF.');
  }
};

export default function StudentProfile({ studentId, onClose }: StudentProfileProps) {
  // Inicjalizacja z połączoną logiką (znajdź wybranego lub domyślnego, wrzuć w stan)
  const initialStudent: Athlete = studentId
    ? MOCK_STUDENTS.find(s => s.id === studentId) || MOCK_STUDENTS[0]
    : MOCK_STUDENTS[0];

  const [student, setStudent] = useState<Athlete>(initialStudent);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const [editForm, setEditForm] = useState({
    weight: student.weight?.toString() || '',
    height: student.height?.toString() || '',
    age: student.age.toString(),
  });

  const ratingScale = useRef(new Animated.Value(0)).current;
  const flamePulse = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(ratingScale, {
      toValue: 1,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Animacja pulsującego płomienia
    Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(flamePulse, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // Rotująca ramka PDF
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Logika biznesowa Streaka
  const calculateStreak = () => {
    const lastDate = new Date(student.lastWorkoutDate).getTime();
    const now = new Date().getTime();
    const gapDays = Math.floor((now - lastDate) / (1000 * 3600 * 24));

    if (gapDays > 3) {
      return 0;
    }
    return student.currentStreak + gapDays;
  };
  const currentStreakValue = calculateStreak();

  const bmiColor = getBMITheme(student.weight || 0, student.height || 100);

  const handleSaveProfile = () => {
    const newWeight = parseFloat(editForm.weight);
    const newHeight = parseFloat(editForm.height);
    const newAge = parseInt(editForm.age, 10);

    if (isNaN(newWeight) || isNaN(newHeight) || isNaN(newAge)) {
      Alert.alert("Błąd", "Wprowadź prawidłowe liczby.");
      return;
    }

    setStudent(prev => {
      const updated = { ...prev, weight: newWeight, height: newHeight, age: newAge };
      if (prev.weight !== newWeight) {
        updated.weightHistory = [
          ...(prev.weightHistory || []),
          { date: new Date().toISOString(), weight: newWeight }
        ];
      }
      return updated;
    });
    setEditModalVisible(false);
  };

  const radarData = [
    { attribute: 'Szybkość', value: student.stats.speed },
    { attribute: 'Siła', value: student.stats.strength },
    { attribute: 'Wytrzymałość', value: student.stats.stamina },
    { attribute: 'Skoczność', value: student.stats.jump },
    { attribute: 'Zwinność', value: student.stats.agility },
  ];

  const statsArray = [
    { label: 'Szybk.', value: student.stats.speed },
    { label: 'Siła', value: student.stats.strength },
    { label: 'Wytrz.', value: student.stats.stamina },
    { label: 'Skok', value: student.stats.jump },
    { label: 'Zwin.', value: student.stats.agility },
  ];

  const maxStat = Math.max(...statsArray.map(s => s.value));
  const minStat = Math.min(...statsArray.map(s => s.value));

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor={Colors.neonGreen} colors={[Colors.neonGreen]} />
        }
      >
        <View style={styles.innerPadding}>
          {/* Header */}
          <View style={styles.headerRow}>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <ArrowLeft size={24} color={Colors.white} />
              </TouchableOpacity>
            )}
            <View style={styles.avatarLarge}>
              {student.avatar && student.avatar.startsWith('http') ? (
                <Image source={{ uri: student.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarLargeText}>👤</Text>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{student.name}</Text>
              <Text style={styles.headerSub}>{student.age} lat • {student.class}</Text>
              <Text style={[styles.headerSub, { color: bmiColor, fontWeight: 'bold' }]}>
                {student.weight} kg • {student.height} cm
              </Text>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setEditModalVisible(true)}>
              <Settings size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Animowany Overall (Lottie Fire.json) */}
          <Animated.View style={[styles.ratingContainer, { transform: [{ scale: ratingScale }] }]}>
            <View style={styles.flameWrapper}>
              <LottieView
                source={require('../../../assets/lottie/Fire.json')}
                autoPlay
                loop
                renderMode="SOFTWARE"
                colorFilters={[{ keypath: '**', color: bmiColor }]}
                style={styles.lottieFlame}
              />
              <Text style={styles.ratingText}>{student.overall}</Text>
            </View>
          </Animated.View>

          {/* Wykres Radarowy */}
          <NeonCard glowColor={bmiColor}>
            <View style={styles.chartContainer}>
              <RadarChart data={radarData} size={320} themeColor={bmiColor} />
            </View>
          </NeonCard>

          {/* Statystyki Pillsy */}
          <View style={styles.statsPillsContainer}>
            {statsArray.map((stat, idx) => {
              const isBest = stat.value === maxStat;
              const isWorst = stat.value === minStat;
              return (
                <View
                  key={stat.label + idx}
                  style={[
                    styles.statPillModern,
                    isBest && styles.statPillBest,
                    isWorst && styles.statPillWorst
                  ]}
                >
                  <Text style={styles.statPillLabel}>{stat.label}</Text>
                  <Text style={[
                    styles.statPillValue,
                    isBest && { color: bmiColor },
                    isWorst && { color: Colors.orange }
                  ]}>
                    {stat.value}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Wykres Progresu Wagi */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>⚖️ Progres Wagi</Text>
            <NeonCard glowColor={bmiColor}>
              <View style={{ overflow: 'hidden', paddingVertical: Spacing.md, marginLeft: -20 }}>
                {student.weightHistory?.length > 0 ? (
                  <LineChart
                    data={{
                      labels: student.weightHistory.map(w => new Date(w.date).toLocaleDateString(undefined, { month: 'short' })),
                      datasets: [
                        {
                          data: student.weightHistory.map(w => w.weight)
                        }
                      ]
                    }}
                    width={screenWidth - Spacing.xl * 2 + 10}
                    height={220}
                    yAxisSuffix="kg"
                    chartConfig={{
                      backgroundColor: "transparent",
                      backgroundGradientFrom: "transparent",
                      backgroundGradientFromOpacity: 0,
                      backgroundGradientTo: "transparent",
                      backgroundGradientToOpacity: 0,
                      decimalPlaces: 1,
                      color: (opacity = 1) => bmiColor,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: bmiColor
                      }
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16
                    }}
                  />
                ) : (
                  <Text style={{ textAlign: 'center', color: Colors.gray }}>Brak danych wagi.</Text>
                )}
              </View>
            </NeonCard>
          </View>

          {/* Streak Badge */}
          <View style={styles.sectionSpacing}>
            <NeonCard>
              <View style={styles.streakBadge}>
                <View style={styles.streakBadgeLeft}>
                  <Animated.View style={{ transform: [{ scale: flamePulse }] }}>
                    <Flame size={24} color={Colors.orange} fill={Colors.orange} />
                  </Animated.View>
                  <Text style={styles.streakBadgeText}>{currentStreakValue} dni z rzędu</Text>
                </View>
                <Text style={styles.streakBadgePoints}>+240 pkt bonus</Text>
              </View>
            </NeonCard>
          </View>

          {/* Badges */}
          <View style={styles.badgesGrid}>
            <View style={styles.badgeItem}>
              <NeonCard>
                <View style={styles.badgeContent}>
                  <NeonIcon Icon={Flame} size={20} color={Colors.orange} />
                  <View>
                    <Text style={styles.badgeTitleOrange}>Underdog +15%</Text>
                    <Text style={styles.badgeSub}>Bonus za rozwój</Text>
                  </View>
                </View>
              </NeonCard>
            </View>
            <View style={styles.badgeItem}>
              <NeonCard>
                <View style={styles.badgeContent}>
                  {student.avatar !== 'default.png' ? (
                    <LottieView
                      source={require('../../../assets/lottie/tick.json')}
                      autoPlay
                      loop
                      style={{ width: 24, height: 24, marginRight: Spacing.sm }}
                    />
                  ) : (
                    <XCircle size={24} color={Colors.red} style={{ marginRight: Spacing.sm }} />
                  )}
                  <View>
                    <Text style={[styles.badgeTitleGreen, student.avatar === 'default.png' && { color: Colors.red }]}>
                      Photo-Check
                    </Text>
                    <Text style={styles.badgeSub}>
                      {student.avatar !== 'default.png' ? 'Zweryfikowano' : 'Brak zdjęcia'}
                    </Text>
                  </View>
                </View>
              </NeonCard>
            </View>
          </View>

          {/* Osiągnięcia */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>🏆 Osiągnięcia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {student.recentAchievements.map((ach: any) => (
                <View key={ach.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{ach.icon}</Text>
                  <Text style={styles.achievementTitle} numberOfLines={2}>{ach.title}</Text>
                  <Text style={styles.achievementDate}>{new Date(ach.date).toLocaleDateString()}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Ostatnie Ćwiczenia */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>📈 Ostatnie Ćwiczenia</Text>
            <View style={styles.exercisesList}>
              {student.recentExercises.map((ex: any) => (
                <View key={ex.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseDate}>{new Date(ex.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.exerciseScore}>{ex.score} pkt</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Przycisk Pobierz PDF */}
          <TouchableOpacity
            style={styles.downloadButtonWrapper}
            activeOpacity={0.8}
            onPress={() => generatePDF(student, currentStreakValue)}
          >
            <Animated.View style={[styles.rotatingBorder, { transform: [{ rotate: spin }] }]} />
            <View style={styles.downloadButtonInner}>
              <Download size={20} color={Colors.white} />
              <Text style={styles.downloadButtonText}>📄 Pobierz Paszport PDF</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profil Edit Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>Edycja Profilu</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wiek</Text>
              <TextInput
                style={styles.input}
                value={editForm.age}
                onChangeText={v => setEditForm(prev => ({ ...prev, age: v }))}
                keyboardType="numeric"
                placeholderTextColor={Colors.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wzrost (cm)</Text>
              <TextInput
                style={styles.input}
                value={editForm.height}
                onChangeText={v => setEditForm(prev => ({ ...prev, height: v }))}
                keyboardType="numeric"
                placeholderTextColor={Colors.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Waga (kg)</Text>
              <TextInput
                style={styles.input}
                value={editForm.weight}
                onChangeText={v => setEditForm(prev => ({ ...prev, weight: v }))}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.gray}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>ZAPISZ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarLargeText: {
    fontSize: 36,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: Colors.white,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSub: {
    color: Colors.gray,
    fontSize: FontSize.base,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  flameWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lottieFlame: {
    width: 220,
    height: 220,
    position: 'absolute',
  },
  ratingText: {
    fontSize: FontSize['6xl'],
    color: Colors.white,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
    zIndex: 2,
    marginTop: 25,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statsPillsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.lg,
  },
  statPillModern: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#1E2A3A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A3B4D',
  },
  statPillBest: {
    borderColor: Colors.neonGreen,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  statPillWorst: {
    borderColor: Colors.orange,
    backgroundColor: 'rgba(255, 109, 0, 0.1)',
  },
  statPillLabel: {
    color: Colors.white,
    fontSize: 11,
    marginBottom: 4,
    opacity: 0.8,
  },
  statPillValue: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  sectionSpacing: {
    marginTop: Spacing.xl,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FF6D0020',
    borderWidth: 1,
    borderColor: Colors.orange,
  },
  streakBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakBadgeText: {
    color: Colors.orange,
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  streakBadgePoints: {
    color: Colors.goldDark,
    fontWeight: '700',
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
  badgesGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  badgeItem: {
    flex: 1,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  badgeTitleOrange: {
    color: Colors.orange,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  badgeTitleGreen: {
    color: Colors.neonGreen,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  badgeSub: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  horizontalScroll: {
    paddingBottom: Spacing.sm,
    marginHorizontal: -Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  achievementCard: {
    backgroundColor: '#1E2A3A',
    borderRadius: 16,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3B4D',
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  achievementTitle: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    color: Colors.gray,
    fontSize: 10,
  },
  exercisesList: {
    gap: Spacing.sm,
  },
  exerciseCard: {
    backgroundColor: '#1E2A3A',
    borderRadius: 16,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2A3B4D',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseDate: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  exerciseScore: {
    color: Colors.neonGreen,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  downloadButtonWrapper: {
    width: '100%',
    height: 56,
    marginTop: Spacing.xxl,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  rotatingBorder: {
    position: 'absolute',
    width: '200%',
    height: 200,
    backgroundColor: Colors.neonGreen,
    top: -70,
    left: -150,
    opacity: 0.8,
  },
  downloadButtonInner: {
    position: 'absolute',
    top: 2, left: 2, right: 2, bottom: 2,
    backgroundColor: Colors.cardBg,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  downloadButtonText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: Colors.bgDeep,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  inputGroup: {
    marginBottom: Spacing.lg
  },
  label: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#1E2A3A',
    color: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#2A3B4D',
  },
  saveBtn: {
    backgroundColor: Colors.neonGreen,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveBtnText: {
    color: Colors.bgDeep,
    fontWeight: 'bold',
    fontSize: FontSize.md,
  }
});
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Alert, Modal, TextInput, Dimensions, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { Download, Flame, CheckCircle, XCircle, ArrowLeft, Settings, X, Sparkles } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import Svg, { Polygon, Circle as SvgCircle, Text as SvgText, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LineChart } from 'react-native-chart-kit';

// FIREBASE
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

// COMPONENTS & UTILS FROM MASTER
import { AchievementsBoard } from '../components/AchievementsBoard';
import { ExerciseRanksCard } from '../components/ExerciseRanksCard';
import { calculateExerciseRanks, calculateAverageRankId } from '../utils/rankCalculator';

interface StudentProfileProps {
  studentId?: string; // Przekazywane przez nauczyciela
  onClose?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const getBMITheme = (weight: number, height: number) => {
  if (!weight || !height) return Colors.neonGreen;
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  if (bmi < 18.5) return '#00C6FF';
  if (bmi >= 18.5 && bmi < 25) return Colors.neonGreen;
  if (bmi >= 25 && bmi < 30) return Colors.orange;
  return Colors.red;
};

// --- RADAR CHART COMPONENT ---
function RadarChart({ data, size = 320, themeColor = Colors.neonGreen }: { data: { attribute: string; value: number }[]; size?: number; themeColor?: string }) {
  const center = size / 2;
  const radius = 105;
  const bgRadius = 155;
  const angleStep = (2 * Math.PI) / data.length;
  const levels = 5;

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
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
      <SvgCircle cx={center} cy={center} r={bgRadius} fill="url(#grad)" />
      {Array.from({ length: levels }, (_, level) => {
        const r = (radius / levels) * (level + 1);
        const points = data.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(' ');
        return <Polygon key={level} points={points} fill="none" stroke={Colors.gray} strokeWidth={1} opacity={0.4} />;
      })}
      {data.map((_, i) => {
        const endPoint = getPoint(100, i);
        return <Line key={`axis-${i}`} x1={center} y1={center} x2={endPoint.x} y2={endPoint.y} stroke={Colors.gray} strokeWidth={1} opacity={0.4} />;
      })}
      <Polygon points={polygonPoints} fill={themeColor} fillOpacity={0.4} stroke={themeColor} strokeWidth={3} />
      {dataPoints.map((p, i) => <SvgCircle key={`dot-${i}`} cx={p.x} cy={p.y} r={5} fill={themeColor} />)}
      {data.map((d, i) => {
        const labelPoint = getPoint(135, i);
        return <SvgText key={`label-${i}`} x={labelPoint.x} y={labelPoint.y} fill={Colors.white} fontSize={12} fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{d.attribute}</SvgText>;
      })}
    </Svg>
  );
}

// --- MAIN COMPONENT ---
export default function StudentProfile({ studentId, onClose }: StudentProfileProps) {
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isAiModalVisible, setAiModalVisible] = useState(false);
  const [isAiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const [editForm, setEditForm] = useState({ weight: '', height: '', age: '' });

  const ratingScale = useRef(new Animated.Value(0)).current;
  const flamePulse = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  const fetchStudentData = async () => {
    try {
      const targetUid = studentId || auth.currentUser?.uid;
      if (!targetUid) {
        setIsLoading(false);
        return;
      }

      const docRef = doc(db, 'students', targetUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudent({ id: docSnap.id, ...data });
        setEditForm({
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          age: data.age?.toString() || '',
        });
      }
    } catch (error) {
      console.error("Błąd pobierania profilu:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const targetUid = studentId || auth.currentUser?.uid;
    if (!targetUid) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'students', targetUid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudent({ id: docSnap.id, ...data });
        setEditForm({
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          age: data.age?.toString() || '',
        });
      }
      setIsLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Błąd pobierania profilu:", error);
      setIsLoading(false);
      setRefreshing(false);
    });

    Animated.spring(ratingScale, { toValue: 1, delay: 200, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(flamePulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
      Animated.timing(flamePulse, { toValue: 1, duration: 800, useNativeDriver: true })
    ])).start();
    Animated.loop(Animated.timing(spinValue, { toValue: 1, duration: 3500, useNativeDriver: true })).start();

    return () => unsubscribe();
  }, [studentId]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleSaveProfile = async () => {
    const newWeight = parseFloat(editForm.weight);
    const newHeight = parseFloat(editForm.height);
    const newAge = parseInt(editForm.age, 10);

    if (isNaN(newWeight) || isNaN(newHeight) || isNaN(newAge)) {
      Alert.alert("Błąd", "Wprowadź prawidłowe dane.");
      return;
    }

    try {
      const targetUid = studentId || auth.currentUser?.uid;
      if (!targetUid) return;
      const docRef = doc(db, 'students', targetUid);

      const newHistoryEntry = { date: new Date().toISOString(), weight: newWeight };
      const updatedHistory = student.weight !== newWeight ? [...(student.weightHistory || []), newHistoryEntry] : (student.weightHistory || []);

      await updateDoc(docRef, { weight: newWeight, height: newHeight, age: newAge, weightHistory: updatedHistory });
      setStudent((prev: any) => ({ ...prev, weight: newWeight, height: newHeight, age: newAge, weightHistory: updatedHistory }));
      setEditModalVisible(false);
      Alert.alert('Sukces', 'Profil zaktualizowany.');
    } catch (e) { Alert.alert('Błąd zapisu'); }
  };

  const fetchAiSummary = async () => {
    try {
      setAiLoading(true);
      setAiSummary('');
      setAiModalVisible(true);

      const prompt = `Jesteś bezwzględnym skautem sportowym. Przeanalizuj tego zawodnika chłodno i analitycznie.

DANE ZAWODNIKA:
- Imię: ${student?.name || 'Nieznany'}
- Wiek: ${student?.age || '-'} lat
- Waga: ${student?.weight || '-'} kg
- Wzrost: ${student?.height || '-'} cm
- Ocena ogólna: ${student?.overall || 60}/100
- Szybkość: ${student?.stats?.speed || 60}/100
- Siła: ${student?.stats?.strength || 60}/100
- Wytrzymałość: ${student?.stats?.stamina || 60}/100
- Skoczność: ${student?.stats?.jump || 60}/100
- Zwinność: ${student?.stats?.agility || 60}/100

Odpowiedz DOKŁADNIE w 4 punktach (po polsku):
1. OCENA OGÓLNA – krótka, brutalna ocena poziomu zawodnika.
2. KADRA – Czy nadaje się do kadry szkolnej? Tak/Nie i dlaczego.
3. SUFIT MOŻLIWOŚCI – Jaki jest jego potencjał rozwojowy i czy warto w niego inwestować.
4. REKOMENDACJA TRENINGOWA – Co konkretnie musi poprawić, żeby awansować.`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;

      if (text) {
        const clean = text.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1').replace(/^#{1,4}\s*/gm, '').replace(/`/g, '');
        setAiSummary(clean);
      } else {
        throw new Error('Brak odpowiedzi z modelu');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      setAiModalVisible(false);
      Alert.alert('Błąd AI', `Nie udało się wygenerować analizy.\n${error.message || 'Sprawdź połączenie.'}`);
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.neonGreen} /></View>;
  }

  if (!student) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
        {onClose && <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 60, left: 20 }}><ArrowLeft size={24} color={Colors.white} /></TouchableOpacity>}
        <Text style={{ color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>Brak danych profilu</Text>
        <Text style={{ color: Colors.gray, fontSize: FontSize.base, textAlign: 'center' }}>Nie znaleziono dokumentu ucznia w bazie danych. Wykonaj najpierw test, aby utworzyć profil.</Text>
      </View>
    );
  }

  // --- LOGIKA RANKINGÓW ---
  const bestResults: Record<string, number> = {};
  if (student.testResults?.length > 0) {
    student.testResults.forEach((test: any) => {
      // Obsługa starego formatu danych
      if (test.plank) bestResults['plank'] = test.plank;
      if (test.sprint) bestResults['run100'] = test.sprint;
      if (test.longJump) bestResults['jump'] = test.longJump;

      // Obsługa nowego formatu danych z TestForm.tsx
      if (test.exercises && Array.isArray(test.exercises)) {
        test.exercises.forEach((ex: any) => {
          if (ex.exerciseId && typeof ex.bestValue === 'number') {
            bestResults[ex.exerciseId] = ex.bestValue;
          }
        });
      }

      // Aktualizujemy globalny stan MOCK_STUDENTS "żeby updatowało się wszędzie" po zamknięciu modal'a.
      const index = MOCK_STUDENTS.findIndex(s => s.id === prev.id);
      if (index !== -1) {
        MOCK_STUDENTS[index] = updated;
      }

      return updated;
    });
  }
  const exerciseRanks = calculateExerciseRanks(bestResults);
  const averageRankId = calculateAverageRankId(exerciseRanks);

  const bmiColor = getBMITheme(student.weight || 0, student.height || 0);

  const getStat = (exerciseIds: string[]) => {
    const ranks = exerciseRanks.filter(r => exerciseIds.includes(r.exerciseId) && r.bestValue > 0);
    if (ranks.length === 0) return 60; // Default
    const avgPercent = ranks.reduce((sum, r) => sum + r.percent, 0) / ranks.length;
    return Math.min(100, Math.round(avgPercent));
  };

  const speed = getStat(['run100']);
  const strength = getStat(['pushups', 'pullups', 'bench', 'squats', 'deadlift']);
  const stamina = getStat(['run1000', 'plank']);
  const jump = getStat(['jump']);
  const agility = getStat(['situps']);

  const dynamicOverall = Math.round((speed + strength + stamina + jump + agility) / 5);

  const radarData = [
    { attribute: 'Szybkość', value: speed },
    { attribute: 'Siła', value: strength },
    { attribute: 'Wytrzymałość', value: stamina },
    { attribute: 'Skoczność', value: jump },
    { attribute: 'Zwinność', value: agility },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStudentData(); }} tintColor={Colors.neonGreen} />}
      >
        <View style={styles.innerPadding}>
          {/* Header */}
          <View style={styles.headerRow}>
            {onClose && <TouchableOpacity onPress={onClose} style={styles.backButton}><ArrowLeft size={24} color={Colors.white} /></TouchableOpacity>}
            <View style={styles.avatarLarge}>
              {student.avatar && student.avatar.startsWith('http') ? (
                <Image source={{ uri: student.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarLargeText}>👤</Text>
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{student.name}</Text>
              <Text style={styles.headerSub}>{student.age || '-'} lat • {student.class}</Text>
              <Text style={[styles.headerSub, { color: bmiColor, fontWeight: 'bold' }]}>{student.weight} kg • {student.height} cm</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setEditModalVisible(true)}><Settings size={22} color={Colors.white} /></TouchableOpacity>
          </View>

          {/* Rating */}
          <Animated.View style={[styles.ratingContainer, { transform: [{ scale: ratingScale }] }]}>
            <View style={styles.flameWrapper}>
              <LottieView source={require('../../../assets/lottie/Fire.json')} autoPlay loop style={styles.lottieFlame} colorFilters={[{ keypath: '**', color: bmiColor }]} />
              <Text style={styles.ratingText}>{dynamicOverall}</Text>
            </View>
          </Animated.View>

          <NeonCard glowColor={bmiColor}>
            <View style={styles.chartContainer}><RadarChart data={radarData} themeColor={bmiColor} /></View>
          </NeonCard>

          {/* Master Components */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>🎖️ Rangi i Medale</Text>
            <AchievementsBoard rankId={averageRankId} earnedMedals={student.earnedMedals || []} />
          </View>

          <View style={styles.sectionSpacing}>
            <ExerciseRanksCard exerciseRanks={exerciseRanks} averageRankId={averageRankId} />
          </View>

          {/* Weight Progress */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>⚖️ Progres Wagi</Text>
            <NeonCard glowColor={bmiColor}>
              <View style={{ overflow: 'hidden', paddingVertical: Spacing.md, marginLeft: -20 }}>
                {student.weightHistory?.length > 1 ? (
                  <LineChart
                    data={{
                      labels: student.weightHistory.map((w: any) => new Date(w.date).toLocaleDateString(undefined, { month: 'short' })),
                      datasets: [{ data: student.weightHistory.map((w: any) => w.weight) }]
                    }}
                    width={screenWidth - Spacing.xl * 2 + 10}
                    height={200}
                    chartConfig={{
                      backgroundColor: "transparent",
                      backgroundGradientFrom: "transparent",
                      backgroundGradientTo: "transparent",
                      color: (opacity = 1) => bmiColor,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      decimalPlaces: 1,
                    }}
                    bezier
                  />
                ) : <Text style={{ color: Colors.gray, textAlign: 'center' }}>Brak historii wagi.</Text>}
              </View>
            </NeonCard>
          </View>

          <TouchableOpacity style={styles.downloadButtonWrapper} activeOpacity={0.8} onPress={() => Alert.alert("Generowanie...", "Twój paszport PDF jest przygotowywany.")}>
            <Animated.View style={[styles.rotatingBorder, { transform: [{ rotate: spin }] }]} />
            <View style={styles.downloadButtonInner}>
              <Download size={20} color={Colors.white} />
              <Text style={styles.downloadButtonText}>📄 Pobierz Paszport PDF</Text>
            </View>
          </TouchableOpacity>

          {/* AI Scouting Button */}
          <TouchableOpacity style={styles.aiButton} activeOpacity={0.8} onPress={fetchAiSummary}>
            <Sparkles size={20} color={Colors.bgDeep} />
            <Text style={styles.aiButtonText}>Analiza Skautingowa AI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Modal */}
      <Modal visible={isAiModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.aiModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.aiModalTitleRow}>
                <Sparkles size={20} color={Colors.neonGreen} />
                <Text style={styles.sectionTitle}>Analiza AI</Text>
              </View>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}><X size={24} color={Colors.gray} /></TouchableOpacity>
            </View>
            {isAiLoading ? (
              <View style={styles.aiLoadingContainer}>
                <ActivityIndicator size="large" color={Colors.neonGreen} />
                <Text style={styles.aiLoadingText}>Przetwarzanie danych przez Google Gemini...</Text>
              </View>
            ) : (
              <ScrollView style={styles.aiScrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.aiSummaryText}>{aiSummary}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.sectionTitle}>Edycja Profilu</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><X size={24} color={Colors.gray} /></TouchableOpacity>
            </View>
            <View style={styles.inputGroup}><Text style={styles.label}>Wzrost (cm)</Text><TextInput style={styles.input} value={editForm.height} onChangeText={v => setEditForm(p => ({ ...p, height: v }))} keyboardType="numeric" placeholderTextColor={Colors.gray} /></View>
            <View style={styles.inputGroup}><Text style={styles.label}>Waga (kg)</Text><TextInput style={styles.input} value={editForm.weight} onChangeText={v => setEditForm(p => ({ ...p, weight: v }))} keyboardType="decimal-pad" placeholderTextColor={Colors.gray} /></View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}><Text style={styles.saveBtnText}>ZAPISZ</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  innerPadding: { padding: Spacing.xl, paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xl },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.neonGreen, overflow: 'hidden' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarLargeText: { fontSize: 36 },
  headerInfo: { flex: 1 },
  headerName: { color: Colors.white, fontSize: FontSize['2xl'], fontWeight: '800' },
  headerSub: { color: Colors.gray, fontSize: FontSize.base },
  settingsButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  ratingContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  flameWrapper: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  lottieFlame: { width: 220, height: 220, position: 'absolute' },
  ratingText: { fontSize: FontSize['6xl'], color: Colors.white, fontWeight: '900', marginTop: 25 },
  chartContainer: { alignItems: 'center', paddingVertical: Spacing.lg },
  sectionSpacing: { marginTop: Spacing.xl },
  sectionTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.md },
  downloadButtonWrapper: { width: '100%', height: 56, marginTop: Spacing.xxl, borderRadius: 28, overflow: 'hidden', justifyContent: 'center' },
  rotatingBorder: { position: 'absolute', width: '200%', height: 200, backgroundColor: Colors.neonGreen, top: -70, left: -150, opacity: 0.8 },
  downloadButtonInner: { position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, backgroundColor: Colors.cardBg, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  downloadButtonText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bgDeep, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, paddingBottom: Spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.lg },
  label: { color: Colors.gray, fontSize: FontSize.sm, marginBottom: Spacing.xs },
  input: { backgroundColor: '#1E2A3A', color: Colors.white, padding: Spacing.md, borderRadius: BorderRadius.md },
  saveBtn: { backgroundColor: Colors.neonGreen, padding: Spacing.md, borderRadius: BorderRadius.full, alignItems: 'center' },
  saveBtnText: { color: Colors.bgDeep, fontWeight: 'bold' },
  backButton: { padding: Spacing.sm },
  aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.lg, backgroundColor: Colors.neonGreen, paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  aiButtonText: { color: Colors.bgDeep, fontWeight: '800', fontSize: FontSize.md, letterSpacing: 0.5 },
  aiModalContent: { backgroundColor: Colors.bgDeep, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, paddingBottom: Spacing.xxl, maxHeight: '80%' },
  aiModalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  aiLoadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  aiLoadingText: { color: Colors.gray, fontSize: FontSize.sm, marginTop: Spacing.lg, textAlign: 'center', fontStyle: 'italic' },
  aiScrollView: { marginTop: Spacing.md },
  aiSummaryText: { color: Colors.white, fontSize: FontSize.base, lineHeight: 24 },
});
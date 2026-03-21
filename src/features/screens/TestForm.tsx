import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ArrowRight, CheckCircle, Plus, Trash2, X } from 'lucide-react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { AnomalyModal } from '../components/AnomalyModal';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList, StudentTabParamList } from '../routes';
import { checkAnomaly } from '../utils/anomalyUtils';

// FIREBASE IMPORTS
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { updateStreak } from '../utils/streakUtils';
import { evaluateAchievements, ACHIEVEMENTS } from '../config/achievements';
import { getRankDisplay } from '../config/ranks';
import { EXERCISES } from '../config/exercises';

type TestFormNavProp = CompositeNavigationProp<
  MaterialTopTabNavigationProp<StudentTabParamList, 'TestForm'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type SetEntry = {
  setId: string;
  value: string;
  weightValue: string;
};

type ActiveExercise = {
  exerciseId: string;
  sets: SetEntry[];
};

function ProgressBar({ percent, forceTrigger }: { percent: number, forceTrigger: number }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const flameAnim = useRef(new Animated.Value(0)).current;

  const [targetPercent, setTargetPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTargetPercent(percent);
    }, 2000);
    return () => clearTimeout(timer);
  }, [percent]);

  useEffect(() => {
    setTargetPercent(percent);
  }, [forceTrigger]);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: targetPercent,
      duration: 800,
      useNativeDriver: false,
    }).start();

    if (targetPercent >= 115) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
          Animated.timing(flameAnim, { toValue: 0, duration: 1200, useNativeDriver: false })
        ])
      ).start();
    } else {
      flameAnim.stopAnimation();
      flameAnim.setValue(0);
    }
  }, [targetPercent]);

  const isFlame = targetPercent >= 115;

  const barColor = isFlame ? flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF4500', '#FFA500']
  }) : animatedWidth.interpolate({
    inputRange: [0, 99, 100, 114],
    outputRange: [Colors.neonGreen, Colors.neonGreen, '#FFD700', '#FFD700'],
    extrapolate: 'clamp'
  });

  const glowRadius = flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 14]
  });

  const borderColor = flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 255, 255, 0.8)']
  });

  return (
    <View style={styles.progressBarBg}>
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            width: animatedWidth.interpolate({
              inputRange: [0, 100, 200],
              outputRange: ['0%', '100%', '100%'],
              extrapolate: 'clamp'
            }),
            backgroundColor: barColor,
            shadowColor: isFlame ? '#FF4500' : Colors.neonGreen,
            shadowRadius: isFlame ? glowRadius : 4,
            shadowOpacity: isFlame ? 0.9 : 0.6,
            borderWidth: isFlame ? 1 : 0,
            borderColor: isFlame ? borderColor : 'transparent',
          },
        ]}
      />
    </View>
  );
}

export default function TestForm() {
  const navigation = useNavigation<TestFormNavProp>();
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [forceUpdateTrigger, setForceUpdateTrigger] = useState(0);
  const [anomalyDetails, setAnomalyDetails] = useState<{
    exerciseName: string;
    improvement: number;
    previousValue: string;
    currentValue: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  // Pobierz dane ucznia z Firebase
  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, 'students', user.uid));
        if (docSnap.exists()) setStudentData(docSnap.data());
      }
    };
    loadUser();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Brak uprawnień', 'Przyznaj dostęp do galerii, aby dodać zdjęcia.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setProofImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const generateFakeFilenames = (count: number): string[] => {
    const ts = Date.now();
    return Array.from({ length: count }, (_, i) => `proof_${i + 1}_${ts}.jpg`);
  };

  const triggerProgressUpdate = () => setForceUpdateTrigger(prev => prev + 1);

  const addExercise = (exerciseId: string) => {
    if (activeExercises.some(ex => ex.exerciseId === exerciseId)) {
      Alert.alert('Blokada', 'Ćwiczenie znajduje się już na liście. Dodaj serie w istniejącej karcie.');
      setIsModalVisible(false);
      return;
    }

    const newExercise: ActiveExercise = {
      exerciseId,
      sets: [{ setId: Math.random().toString(36).substring(7), value: '', weightValue: '' }]
    };
    setActiveExercises([...activeExercises, newExercise]);
    setIsModalVisible(false);
  };

  const removeExercise = (exerciseId: string) => {
    setActiveExercises(activeExercises.filter(ex => ex.exerciseId !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.exerciseId === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, { setId: Math.random().toString(36).substring(7), value: '', weightValue: '' }]
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.exerciseId === exerciseId) {
        return { ...ex, sets: ex.sets.filter(s => s.setId !== setId) };
      }
      return ex;
    }));
  };

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateSet = (exerciseId: string, setId: string, field: 'value' | 'weightValue', newValue: string) => {
    setActiveExercises(prev => prev.map(ex => {
      if (ex.exerciseId === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.setId === setId ? { ...s, [field]: newValue } : s)
        };
      }
      return ex;
    }));
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerProgressUpdate();
    }, 300);
  };

  const getBestValue = (ex: ActiveExercise, exerciseDef: any) => {
    if (ex.sets.length === 0) return 0;

    const values = ex.sets.map(s => {
      if (exerciseDef.type === 'weight_reps') return parseFloat(s.weightValue) || 0;
      return parseFloat(s.value) || 0;
    });

    if (exerciseDef.scoring === 'lower') {
      const validValues = values.filter(v => v > 0);
      return validValues.length > 0 ? Math.min(...validValues) : 0;
    }
    return Math.max(...values, 0);
  };

  const getPercent = (ex: ActiveExercise, exerciseDef: any) => {
    const num = getBestValue(ex, exerciseDef);
    if (num === 0) return 0;

    const avg = exerciseDef.average;

    if (exerciseDef.scoring === 'lower') {
      return (avg / num) * 100;
    }
    return (num / avg) * 100;
  };

  const handleSubmit = () => {
    if (activeExercises.length === 0) {
      Alert.alert('Błąd', 'Dodaj co najmniej jedno ćwiczenie do weryfikacji.');
      return;
    }

    let hasErrors = false;
    activeExercises.forEach(ex => {
      const exerciseDef = EXERCISES.find(e => e.id === ex.exerciseId);
      if (ex.sets.length === 0) hasErrors = true;

      ex.sets.forEach(set => {
        const valNum = parseFloat(set.value);
        if (isNaN(valNum) || valNum < 0 || set.value.trim() === '') hasErrors = true;
        if (exerciseDef?.type === 'weight_reps' && set.weightValue.trim() !== '') {
          const weightNum = parseFloat(set.weightValue);
          if (isNaN(weightNum) || weightNum < 0) hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      Alert.alert('Błąd struktury danych', 'Zidentyfikowano puste lub nieliczbowe pola w seriach.');
      return;
    }

    if (proofImages.length === 0) {
      Alert.alert(
        "Weryfikacja zagrożona",
        "Brak dokumentacji fotograficznej. Ryzyko odrzucenia wyników.",
        [
          { text: "Anuluj", style: "cancel" },
          { text: "Wymuś wysłanie", onPress: () => processSubmit() }
        ]
      );
    } else {
      processSubmit();
    }
  };

  const processSubmit = async () => {
    try {
      setIsSubmitting(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Brak autoryzacji");

      // KROK 1: Symulacja uploadu zdjęć
      await new Promise(resolve => setTimeout(resolve, 1000));

      const fakeProofFilenames = proofImages.length > 0 ? generateFakeFilenames(proofImages.length) : [];

      // KROK 2: Przygotuj obiekt nowego testu
      const exercisesPayload = activeExercises.map(ex => {
        const def = EXERCISES.find(e => e.id === ex.exerciseId);
        return {
          exerciseId: ex.exerciseId,
          name: def?.name ?? ex.exerciseId,
          unit: def?.unit ?? '',
          sets: ex.sets.map(s => ({
            value: parseFloat(s.value) || 0,
            weightValue: parseFloat(s.weightValue) || 0,
          })),
          bestValue: getBestValue(ex, def),
        };
      });

      const newTestRecord = {
        date: new Date().toISOString(),
        exercises: exercisesPayload,
        proofFilenames: fakeProofFilenames,
        status: 'pending',
      };

      // KROK 3: Ewaluacja osiągnięć (medali)
      const referenceStudent = {
        weight: studentData?.weight || 0,
        height: studentData?.height || 0,
        rankId: studentData?.rankId || 0,
        earnedMedals: studentData?.earnedMedals || [],
        testResults: studentData?.testResults || [],
      };

      const { newMedals, highestRankReward } = evaluateAchievements(exercisesPayload, referenceStudent as any);

      const firebaseUpdate: Record<string, any> = {
        testResults: arrayUnion(newTestRecord),
        lastWorkoutDate: new Date().toISOString(),
      };

      if (newMedals.length > 0) {
        firebaseUpdate.earnedMedals = arrayUnion(...newMedals);
      }

      if (highestRankReward !== null && highestRankReward > (studentData?.rankId || 0)) {
        firebaseUpdate.rankId = highestRankReward;
      }

      // KROK 4: Zapis do Firestore
      const studentRef = doc(db, 'students', user.uid);
      await updateDoc(studentRef, firebaseUpdate);

      // KROK 5: Aktualizacja streak
      await updateStreak();

      // KROK 6: Reset formularza do stanu początkowego
      setActiveExercises([]);
      setProofImages([]);
      setAnomalyDetails(null);
      setForceUpdateTrigger(0);

      // KROK 7: Łańcuch powiadomień UI
      const showAnomalyCheck = () => {
        const history = studentData?.testResults || [];
        let detectedAnomaly = false;

        activeExercises.forEach(ex => {
          const def = EXERCISES.find(e => e.id === ex.exerciseId);
          if (!def) return;

          const currentScore = getBestValue(ex, def);
          if (currentScore <= 0) return;

          let previousScore = def.average;
          // Szukaj poprzedniego wyniku w historii Firebase
          const lastMatchingTest = [...history].reverse().find((t: any) =>
            t.exercises?.some((e: any) => e.exerciseId === ex.exerciseId));
          if (lastMatchingTest) {
            const prevEx = lastMatchingTest.exercises?.find((e: any) => e.exerciseId === ex.exerciseId);
            if (prevEx) previousScore = prevEx.bestValue;
          }

          const isAnomaly = def.scoring === 'lower'
            ? checkAnomaly(previousScore, currentScore)
            : checkAnomaly(currentScore, previousScore);

          if (isAnomaly && !detectedAnomaly) {
            detectedAnomaly = true;
            const improvement = def.scoring === 'lower'
              ? Math.round(((previousScore - currentScore) / previousScore) * 100)
              : Math.round(((currentScore - previousScore) / previousScore) * 100);

            setAnomalyDetails({
              exerciseName: def.name,
              improvement,
              previousValue: `${previousScore}${def.unit}`,
              currentValue: `${currentScore}${def.unit}`,
            });
          }
        });

        if (detectedAnomaly) {
          setShowAnomalyModal(true);
        } else {
          Alert.alert('Zapis wysłany', 'Wyniki zostały przesłane. Czekają na zatwierdzenie przez nauczyciela.', [
            { text: 'OK', onPress: () => navigation.navigate('StudentProfile') },
          ]);
        }
      };

      if (newMedals.length > 0) {
        const medalNames = newMedals
          .map(id => ACHIEVEMENTS.find(a => a.id === id)?.name ?? id)
          .join(', ');

        const rankMsg = highestRankReward !== null && highestRankReward > (studentData?.rankId || 0)
          ? `\nNowa ranga: ${getRankDisplay(highestRankReward)} 🎖️`
          : '';

        Alert.alert(
          '🏆 Nowe Osiągnięcie!',
          `Zdobyto: ${medalNames}${rankMsg}`,
          [{ text: 'Super!', onPress: showAnomalyCheck }],
        );
      } else {
        showAnomalyCheck();
      }
    } catch (error) {
      console.error('Błąd wysyłki:', error);
      Alert.alert('Błąd', 'Nie udało się wysłać wyników. Sprawdź połączenie i spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>
          <Text style={styles.screenTitle}>Rejestracja Wyników</Text>

          {activeExercises.length === 0 && (
            <Text style={styles.emptyStateText}>Brak aktywnych pomiarów w buforze.</Text>
          )}

          {activeExercises.map((ex) => {
            const exerciseDef = EXERCISES.find(e => e.id === ex.exerciseId)!;
            const bestResult = getBestValue(ex, exerciseDef);

            return (
              <View key={ex.exerciseId} style={styles.fieldSpacing}>
                <NeonCard>
                  <View style={styles.fieldContent}>
                    <View style={styles.fieldHeaderDynamic}>
                      <View style={styles.fieldHeaderLeft}>
                        <Text style={styles.fieldEmoji}>{exerciseDef.emoji}</Text>
                        <Text style={styles.fieldLabel}>{exerciseDef.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeExercise(ex.exerciseId)}>
                        <Trash2 size={20} color={Colors.gray} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.setsContainer}>
                      {ex.sets.map((set, index) => (
                        <View key={set.setId} style={styles.setRow}>
                          <Text style={styles.setNumber}>{index + 1}</Text>

                          {exerciseDef.type === 'weight_reps' ? (
                            <View style={styles.setInputsWeight}>
                              <View style={styles.halfInput}>
                                <TextInput
                                  style={styles.inputSmall}
                                  value={set.weightValue}
                                  onChangeText={(val) => updateSet(ex.exerciseId, set.setId, 'weightValue', val)}
                                  onBlur={triggerProgressUpdate}
                                  placeholder="kg"
                                  placeholderTextColor="rgba(136, 153, 170, 0.5)"
                                  keyboardType="numeric"
                                />
                              </View>
                              <View style={styles.halfInput}>
                                <TextInput
                                  style={styles.inputSmall}
                                  value={set.value}
                                  onChangeText={(val) => updateSet(ex.exerciseId, set.setId, 'value', val)}
                                  onBlur={triggerProgressUpdate}
                                  placeholder="powt."
                                  placeholderTextColor="rgba(136, 153, 170, 0.5)"
                                  keyboardType="numeric"
                                />
                              </View>
                            </View>
                          ) : (
                            <View style={styles.setInputsSingle}>
                              <TextInput
                                style={styles.inputSmall}
                                value={set.value}
                                onChangeText={(val) => updateSet(ex.exerciseId, set.setId, 'value', val)}
                                onBlur={triggerProgressUpdate}
                                placeholder={exerciseDef.unit}
                                placeholderTextColor="rgba(136, 153, 170, 0.5)"
                                keyboardType="decimal-pad"
                              />
                            </View>
                          )}

                          <TouchableOpacity onPress={() => removeSet(ex.exerciseId, set.setId)} style={styles.removeSetBtn}>
                            <X size={18} color={Colors.gray} />
                          </TouchableOpacity>
                        </View>
                      ))}

                      <TouchableOpacity onPress={() => addSet(ex.exerciseId)} style={styles.addSetBtn}>
                        <Text style={styles.addSetBtnText}>+ Inicjalizuj Serię</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.progressSection}>
                      <ProgressBar percent={getPercent(ex, exerciseDef)} forceTrigger={forceUpdateTrigger} />
                      <View style={styles.progressMeta}>
                        <Text style={styles.fieldHint}>BAZA: {exerciseDef.average}{exerciseDef.unit}</Text>
                        <Text style={styles.bestResultText}>PEAK: {bestResult > 0 ? bestResult : '-'}{exerciseDef.unit}</Text>
                      </View>
                    </View>
                  </View>
                </NeonCard>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.addExerciseButton}
            activeOpacity={0.8}
            onPress={() => setIsModalVisible(true)}
          >
            <Plus size={20} color={Colors.neonGreen} />
            <Text style={styles.addExerciseText}>DODAJ POMIAR</Text>
          </TouchableOpacity>

          <View style={styles.fieldSpacing}>
            <NeonCard>
              <View style={styles.fieldContent}>
                <View style={styles.photoHeader}>
                  <NeonIcon Icon={Camera} size={20} color={Colors.neonGreen} />
                  <Text style={styles.photoHeaderText}>Protokół Anti-Cheat</Text>
                </View>
                {proofImages.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
                    <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                      {proofImages.map((uri, idx) => (
                        <View key={idx} style={{ position: 'relative' }}>
                          <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                          <TouchableOpacity
                            onPress={() => setProofImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <X size={12} color={Colors.white} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
                <TouchableOpacity
                  style={[
                    styles.photoButton,
                    proofImages.length > 0 && styles.photoButtonAdded,
                  ]}
                  activeOpacity={0.8}
                  onPress={pickImage}
                >
                  {proofImages.length > 0 ? (
                    <>
                      <Plus size={24} color={Colors.neonGreen} />
                      <Text style={styles.photoAddedText}>Dodaj więcej zdjęć</Text>
                    </>
                  ) : (
                    <>
                      <Camera size={32} color={Colors.gray} />
                      <Text style={styles.photoPlaceholderText}>Prześlij skan dowodowy</Text>
                    </>
                  )}
                </TouchableOpacity>
                {proofImages.length > 0 && (
                  <View style={styles.photoVerifiedRow}>
                    <CheckCircle size={16} color={Colors.neonGreen} />
                    <Text style={styles.photoVerifiedText}>{proofImages.length} {proofImages.length === 1 ? 'zdjęcie dodane' : 'zdjęć dodanych'}</Text>
                  </View>
                )}
              </View>
            </NeonCard>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && { opacity: 0.5 }]}
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color={Colors.bgDeep} />
                  <Text style={styles.submitButtonText}>PRZESYŁANIE DANYCH...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>TRANSMISJA DANYCH</Text>
                  <ArrowRight size={20} color={Colors.bgDeep} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <AnomalyModal
        isOpen={showAnomalyModal}
        onClose={() => {
          setShowAnomalyModal(false);
          navigation.navigate('StudentDashboard');
        }}
        onViewProfile={() => {
          setShowAnomalyModal(false);
          navigation.navigate('StudentProfile');
        }}
        onConfirm={() => {
          Alert.alert('Status', 'Wysłano pomyślnie. Wynik czeka na weryfikację nauczyciela.', [
            { text: 'OK', onPress: () => navigation.navigate('StudentProfile') }
          ]);
        }}
        studentName={studentData?.name || "Uczeń"}
        improvement={anomalyDetails?.improvement}
        previousValue={anomalyDetails?.previousValue}
        currentValue={anomalyDetails?.currentValue}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Katalog Parametrów</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {EXERCISES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.modalItem}
                  onPress={() => addExercise(exercise.id)}
                >
                  <Text style={styles.modalItemEmoji}>{exercise.emoji}</Text>
                  <View>
                    <Text style={styles.modalItemName}>{exercise.name}</Text>
                    <Text style={styles.modalItemType}>
                      {exercise.type === 'weight_reps' ? 'Zmienne: Masa + Repetycje' : `Skala: ${exercise.unit}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  screenTitle: { color: Colors.white, fontSize: FontSize['2xl'], fontWeight: '800', marginBottom: Spacing.xl },
  fieldSpacing: { marginBottom: Spacing.lg },
  fieldContent: { gap: Spacing.md },
  fieldEmoji: { fontSize: 30 },
  fieldLabel: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  progressBarBg: { height: 8, backgroundColor: Colors.bgDeep, borderRadius: BorderRadius.full, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: BorderRadius.full, elevation: 4 },
  fieldHint: { color: Colors.gray, fontSize: FontSize.xs },
  bestResultText: { color: Colors.neonGreen, fontSize: FontSize.xs, fontWeight: 'bold' },
  progressSection: { marginTop: Spacing.sm },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },

  photoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  photoHeaderText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.base },
  photoButton: { width: '100%', paddingVertical: Spacing.xxl, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(0, 230, 118, 0.3)', borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  photoButtonAdded: { backgroundColor: 'rgba(0, 230, 118, 0.1)' },
  photoAddedText: { color: Colors.neonGreen, fontWeight: '600', fontSize: FontSize.base },
  photoPlaceholderText: { color: Colors.gray, fontSize: FontSize.base },
  photoVerifiedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  photoVerifiedText: { color: Colors.neonGreen, fontSize: FontSize.sm },
  buttonsContainer: { gap: Spacing.md, marginTop: Spacing.xl },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, width: '100%', paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: Colors.neonGreen, shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  submitButtonText: { color: Colors.bgDeep, fontWeight: '700', fontSize: FontSize.base },

  emptyStateText: { color: Colors.gray, fontSize: FontSize.base, textAlign: 'center', marginBottom: Spacing.xl, fontStyle: 'italic' },
  fieldHeaderDynamic: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  fieldHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },

  setsContainer: { marginVertical: Spacing.sm },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  setNumber: { color: Colors.gray, fontSize: FontSize.sm, fontWeight: 'bold', width: 20, textAlign: 'center' },
  setInputsWeight: { flex: 1, flexDirection: 'row', gap: Spacing.sm },
  setInputsSingle: { flex: 1 },
  halfInput: { flex: 1 },
  inputSmall: { backgroundColor: Colors.bgDeep, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)', borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, color: Colors.white, fontSize: FontSize.base, fontWeight: '600', textAlign: 'center' },
  removeSetBtn: { padding: Spacing.xs },
  addSetBtn: { marginTop: Spacing.xs, paddingVertical: Spacing.sm, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  addSetBtnText: { color: Colors.neonGreen, fontSize: FontSize.sm, fontWeight: '600' },

  addExerciseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, width: '100%', paddingVertical: Spacing.md, borderRadius: BorderRadius.full, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.5)', marginBottom: Spacing.xl },
  addExerciseText: { color: Colors.neonGreen, fontSize: FontSize.base, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bgDeep, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: Spacing.xl, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: 'bold' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: Spacing.md },
  modalItemEmoji: { fontSize: 24 },
  modalItemName: { color: Colors.white, fontSize: FontSize.base, fontWeight: '600' },
  modalItemType: { color: Colors.gray, fontSize: FontSize.xs, marginTop: 2 }
});
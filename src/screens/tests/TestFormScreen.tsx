import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Camera, Send, ArrowRight, CheckCircle } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';
import { NeonIcon } from '../../components/NeonIcon';
import { AnomalyModal } from '../../components/AnomalyModal';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export default function TestFormScreen() {
  const navigation = useNavigation<any>();
  const [plank, setPlank] = useState("");
  const [sprint, setSprint] = useState("");
  const [jump, setJump] = useState("");
  const [photoAdded, setPhotoAdded] = useState(false);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);

  const handleSubmit = () => {
    if (!plank || !sprint || !jump) {
      Alert.alert("Błąd", "Uzupełnij wszystkie pola!");
      return;
    }
    
    const sprintValue = parseFloat(sprint);
    if (sprintValue < 14) {
      setShowAnomalyModal(true);
    } else {
      Alert.alert("Sukces", "Wyniki zatwierdzone! 🎉\nSprawdź swój profil");
      setTimeout(() => {
        navigation.navigate("ProfileScreen");
      }, 1500);
    }
  };

  const averages = {
    plank: 90,
    sprint: 15.2,
    jump: 165,
  };

  const getProgress = (value: string, type: "plank" | "sprint" | "jump") => {
    if (!value) return 0;
    const num = parseFloat(value);
    const avg = averages[type];
    
    if (type === "sprint") {
      return Math.max(0, Math.min(100, ((avg - num) / avg) * 100 + 50));
    }
    return Math.max(0, Math.min(100, (num / avg) * 100));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.Text entering={FadeInDown} style={styles.title}>
          Nowy Test Sportowy
        </Animated.Text>

        <View style={styles.fields}>
          {/* Plank */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <NeonCard>
              <View style={styles.inputCardContent}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputEmoji}>🧘</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Plank</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={plank}
                        onChangeText={setPlank}
                        placeholder="np. 120"
                        placeholderTextColor="#8899AA"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputSuffix}>sekund</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${getProgress(plank, 'plank')}%` }]}>
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                      <Defs>
                        <LinearGradient id="progGrad1" x1="0" y1="0" x2="1" y2="0">
                          <Stop offset="0" stopColor="#00E676" />
                          <Stop offset="1" stopColor="#00A854" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#progGrad1)" />
                    </Svg>
                  </View>
                </View>
                <Text style={styles.averageText}>Średnia szkoły: 90s</Text>
              </View>
            </NeonCard>
          </Animated.View>

          {/* Sprint */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <NeonCard>
              <View style={styles.inputCardContent}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputEmoji}>🏃</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bieg 100m</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={sprint}
                        onChangeText={setSprint}
                        placeholder="np. 13.4"
                        placeholderTextColor="#8899AA"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputSuffix}>sekund</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${getProgress(sprint, 'sprint')}%` }]}>
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                      <Defs>
                        <LinearGradient id="progGrad2" x1="0" y1="0" x2="1" y2="0">
                          <Stop offset="0" stopColor="#00E676" />
                          <Stop offset="1" stopColor="#00A854" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#progGrad2)" />
                    </Svg>
                  </View>
                </View>
                <Text style={styles.averageText}>Średnia szkoły: 15.2s</Text>
              </View>
            </NeonCard>
          </Animated.View>

          {/* Jump */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <NeonCard>
              <View style={styles.inputCardContent}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputEmoji}>📏</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Skok w dal</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={jump}
                        onChangeText={setJump}
                        placeholder="np. 175"
                        placeholderTextColor="#8899AA"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputSuffix}>cm</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${getProgress(jump, 'jump')}%` }]}>
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                      <Defs>
                        <LinearGradient id="progGrad3" x1="0" y1="0" x2="1" y2="0">
                          <Stop offset="0" stopColor="#00E676" />
                          <Stop offset="1" stopColor="#00A854" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#progGrad3)" />
                    </Svg>
                  </View>
                </View>
                <Text style={styles.averageText}>Średnia szkoły: 165cm</Text>
              </View>
            </NeonCard>
          </Animated.View>
        </View>

        {/* Photo Verification */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.photoSection}>
          <NeonCard>
            <View style={styles.photoHeader}>
              <NeonIcon Icon={Camera} size={20} color="#00E676" />
              <Text style={styles.photoTitle}>Anti-Cheat</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.photoButton, photoAdded && styles.photoButtonAdded]}
              onPress={() => setPhotoAdded(true)}
              activeOpacity={0.8}
            >
              {photoAdded ? (
                <>
                  <CheckCircle size={32} color="#00E676" />
                  <Text style={styles.photoAddedText}>Zdjęcie dodane</Text>
                </>
              ) : (
                <>
                  <Camera size={32} color="#8899AA" />
                  <Text style={styles.photoText}>Dodaj zdjęcie weryfikacyjne</Text>
                </>
              )}
            </TouchableOpacity>
            
            {photoAdded && (
              <Animated.View entering={ZoomIn}>
                <Text style={styles.photoVerifiedText}>✅ Zweryfikowano przez Photo-Check</Text>
              </Animated.View>
            )}
          </NeonCard>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <Animated.View entering={FadeInDown.delay(500)}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                <Defs>
                  <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#00E676" />
                    <Stop offset="1" stopColor="#00A854" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#btnGrad)" rx="28" />
              </Svg>
              <Text style={styles.submitBtnText}>ZATWIERDŹ WYNIKI</Text>
              <ArrowRight size={20} color="#0A0E1A" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)}>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
              <Send size={16} color="#8899AA" />
              <Text style={styles.secondaryBtnText}>Wyślij do Ministerstwa Sportu ↗</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      <AnomalyModal
        isOpen={showAnomalyModal}
        onClose={() => setShowAnomalyModal(false)}
        onConfirm={() => {
          Alert.alert("Sukces", "Wyniki zatwierdzone! 🎉\nSprawdź swój profil");
        }}
      />
    </KeyboardAvoidingView>
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
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  fields: {
    gap: 16,
    marginBottom: 24,
  },
  inputCardContent: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputEmoji: {
    fontSize: 28,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0E1A',
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    height: '100%',
  },
  inputSuffix: {
    color: '#8899AA',
    fontSize: 14,
    marginLeft: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#0A0E1A',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  averageText: {
    color: '#8899AA',
    fontSize: 12,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  photoButton: {
    width: '100%',
    paddingVertical: 32,
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  photoButtonAdded: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  photoText: {
    color: '#8899AA',
  },
  photoAddedText: {
    color: '#00E676',
    fontWeight: '600',
  },
  photoVerifiedText: {
    color: '#00E676',
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  submitBtnText: {
    color: '#0A0E1A',
    fontWeight: '700',
    fontSize: 16,
    zIndex: 2,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E2A3A',
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderWidth: 1,
  },
  secondaryBtnText: {
    color: '#8899AA',
  }
});

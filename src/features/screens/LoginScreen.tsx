import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Trophy, Mail, Lock, School, MapPin, ChevronDown, Check, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList } from '../routes';

// --- FIREBASE IMPORTS ---
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

// (Opcjonalnie) Import funkcji do zasilenia bazy
import { seedFirestore } from '../utils/seedFirestore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- KOMPONENT ANIMACJI TŁA ---
function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(y)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay * 1000),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
          Animated.timing(translateY, {
            toValue: Math.random() * SCREEN_HEIGHT,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.particle, { left: x, opacity, transform: [{ translateY }] }]}
    />
  );
}

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // --- STANY UI (Role / Formularz) ---
  const [step, setStep] = useState<'role_selection' | 'auth_form'>('role_selection');
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  // --- STANY FORMULARZA (Firebase) ---
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [schoolsList, setSchoolsList] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [isSchoolDropdownOpen, setSchoolDropdownOpen] = useState(false);

  const [isAddingNewSchool, setIsAddingNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');

  // --- ANIMACJE BAZOWE ---
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(-30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const trophyBounce = useRef(new Animated.Value(0)).current;

  // --- ANIMACJE PRZYCISKÓW ROLI ---
  const btn1Opacity = useRef(new Animated.Value(0)).current;
  const btn1TranslateX = useRef(new Animated.Value(-50)).current;
  const btn2Opacity = useRef(new Animated.Value(0)).current;
  const btn2TranslateX = useRef(new Animated.Value(50)).current;
  const schoolOpacity = useRef(new Animated.Value(0)).current;

  // --- ANIMACJE FORMULARZA ---
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  // INICJALIZACJA: Pobieranie bazy i start głównych animacji
  useEffect(() => {
    // 1. Animacje wjazdowe z oryginalnego projektu
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(contentTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(btn1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn1TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btn2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn2TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(schoolOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // 2. Odbijający się puchar
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyBounce, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(trophyBounce, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // 3. Pobieranie szkół z Firebase
    const fetchSchools = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'schools'));
        const schools = snapshot.docs.map(doc => doc.data().name);
        if (schools.length > 0) setSchoolsList(schools);
        else setSchoolsList(['Szkoła Podstawowa nr 1', 'I Liceum Ogólnokształcące']);
      } catch (error) {
        console.log("Błąd pobierania szkół:", error);
      }
    };
    fetchSchools();
  }, []);

  const particles = Array.from({ length: 15 }, (_, i) => ({
    key: i, x: Math.random() * SCREEN_WIDTH, y: Math.random() * SCREEN_HEIGHT, delay: Math.random() * 2,
  }));

  // PRZEJŚCIE DO FORMULARZA
  const handleSelectRole = (selectedRole: 'student' | 'teacher') => {
    // Chowamy główne przyciski
    Animated.parallel([
      Animated.timing(btn1Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(btn2Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(schoolOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setRole(selectedRole);
      setStep('auth_form');
      // Pokazujemy formularz
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  };

  // POWRÓT DO WYBORU ROLI
  const handleBackToRoles = () => {
    Animated.parallel([
      Animated.timing(formOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(formTranslateY, { toValue: 30, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setStep('role_selection');
      Animated.parallel([
        Animated.timing(btn1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(schoolOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  };

  // LOGIKA AUTORYZACJI FIREBASE
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleAuth = async () => {
    if (!email || !password) return Alert.alert('Błąd', 'Wypełnij email i hasło.');
    if (!validateEmail(email)) return Alert.alert('Błąd', 'Podaj poprawny adres e-mail.');

    if (!isLogin) {
      if (password !== confirmPassword) return Alert.alert('Błąd', 'Hasła nie są identyczne.');
      if (password.length < 6) return Alert.alert('Błąd', 'Hasło musi mieć minimum 6 znaków.');
      if (!isAddingNewSchool && !selectedSchool) return Alert.alert('Błąd', 'Wybierz szkołę z listy.');
      if (isAddingNewSchool && (!newSchoolName || !newSchoolAddress)) return Alert.alert('Błąd', 'Podaj nazwę i adres nowej szkoły.');
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        let userRole = role;
        if (userDoc.exists()) userRole = userDoc.data().role;

        if (userRole === 'student') navigation.replace('StudentTabs', { screen: 'StudentDashboard' } as any);
        else navigation.replace('TeacherTabs', { screen: 'TeacherDashboard' } as any);

      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        let finalSchool = selectedSchool;

        if (role === 'teacher' && isAddingNewSchool) {
          finalSchool = newSchoolName;
          const schoolId = newSchoolName.replace(/\s+/g, '_').toLowerCase();
          await setDoc(doc(db, 'schools', schoolId), {
            name: newSchoolName,
            address: newSchoolAddress,
            createdAt: new Date().toISOString()
          });
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          role: role,
          school: finalSchool,
          createdAt: new Date().toISOString()
        });

        if (role === 'student') navigation.replace('StudentTabs', { screen: 'StudentDashboard' } as any);
        else navigation.replace('TeacherTabs', { screen: 'TeacherDashboard' } as any);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') Alert.alert('Błąd', 'Ten email jest zarejestrowany.');
      else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') Alert.alert('Błąd', 'Błędny email lub hasło.');
      else Alert.alert('Błąd autoryzacji', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Tło - Latające cząsteczki */}
      {particles.map((p) => (
        <FloatingParticle key={p.key} delay={p.delay} x={p.x} y={p.y} />
      ))}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>

          {/* HEADER Z PUCHAREM */}
          <Animated.View style={[styles.trophyContainer, { transform: [{ translateY: trophyBounce }] }]}>
            <View style={styles.trophyGlow}>
              <NeonIcon Icon={Trophy} size={80} color={Colors.neonGreen} glow />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: titleOpacity }}>
            <Text style={styles.title}>SportRecrut</Text>
          </Animated.View>

          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={styles.subtitle}>Platforma talentów sportowych</Text>
          </Animated.View>

          {/* KROK 1: WYBÓR ROLI */}
          {step === 'role_selection' && (
            <View style={styles.buttonsContainer}>
              <Animated.View style={{ opacity: btn1Opacity, transform: [{ translateX: btn1TranslateX }] }}>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => handleSelectRole('teacher')}>
                  <Text style={styles.primaryButtonText}>Jestem Nauczycielem</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ opacity: btn2Opacity, transform: [{ translateX: btn2TranslateX }] }}>
                <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8} onPress={() => handleSelectRole('student')}>
                  <Text style={styles.outlineButtonText}>Jestem Uczniem</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{ opacity: schoolOpacity }}>
                <Text style={styles.schoolInfo}>Zasilane przez Firestore 🔥</Text>
              </Animated.View>
            </View>
          )}

          {/* KROK 2: FORMULARZ LOGOWANIA/REJESTRACJI */}
          {step === 'auth_form' && (
            <Animated.View style={[styles.formSection, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>

              <TouchableOpacity style={styles.backButton} onPress={handleBackToRoles}>
                <ArrowLeft size={20} color={Colors.gray} />
                <Text style={styles.backButtonText}>Zmień rolę ({role === 'teacher' ? 'Nauczyciel' : 'Uczeń'})</Text>
              </TouchableOpacity>

              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => { setIsLogin(true); setIsAddingNewSchool(false); }}>
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Logowanie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Rejestracja</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Adres e-mail"
                  placeholderTextColor={Colors.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Hasło"
                  placeholderTextColor={Colors.gray}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* POLA TYLKO DLA REJESTRACJI */}
              {!isLogin && (
                <>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={Colors.gray} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Powtórz hasło"
                      placeholderTextColor={Colors.gray}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>

                  {!isAddingNewSchool && (
                    <View style={[styles.inputWrapper, { zIndex: 10 }]}>
                      <School size={20} color={Colors.gray} style={styles.inputIcon} />
                      <TouchableOpacity style={styles.dropdownSelector} onPress={() => setSchoolDropdownOpen(!isSchoolDropdownOpen)}>
                        <Text style={[styles.dropdownText, !selectedSchool && { color: Colors.gray }]}>
                          {selectedSchool || 'Wybierz swoją szkołę...'}
                        </Text>
                        <ChevronDown size={20} color={Colors.gray} />
                      </TouchableOpacity>

                      {isSchoolDropdownOpen && (
                        <View style={styles.dropdownListInline}>
                          {schoolsList.map((school, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.dropdownItem}
                              onPress={() => { setSelectedSchool(school); setSchoolDropdownOpen(false); }}
                            >
                              <Text style={styles.dropdownItemText}>{school}</Text>
                              {selectedSchool === school && <Check size={16} color={Colors.neonGreen} />}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {role === 'teacher' && (
                    <TouchableOpacity style={styles.addSchoolToggle} onPress={() => { setIsAddingNewSchool(!isAddingNewSchool); setSchoolDropdownOpen(false); setSelectedSchool(''); }}>
                      <Text style={styles.addSchoolToggleText}>
                        {isAddingNewSchool ? '← Wróć do wyboru z listy' : '+ Nie ma Twojej szkoły? Dodaj nową'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isAddingNewSchool && (
                    <View style={styles.newSchoolContainer}>
                      <View style={styles.inputWrapper}>
                        <School size={20} color={Colors.gray} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Pełna nazwa szkoły" placeholderTextColor={Colors.gray} value={newSchoolName} onChangeText={setNewSchoolName} />
                      </View>
                      <View style={styles.inputWrapper}>
                        <MapPin size={20} color={Colors.gray} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder="Miasto, Ulica" placeholderTextColor={Colors.gray} value={newSchoolAddress} onChangeText={setNewSchoolAddress} />
                      </View>
                    </View>
                  )}
                </>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleAuth}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color={Colors.bgDeep} /> : <Text style={styles.primaryButtonText}>{isLogin ? 'ZALOGUJ SIĘ' : 'UTWÓRZ KONTO'}</Text>}
              </TouchableOpacity>

              {/* DEV PRZYCISK - zasilenie bazy */}
              <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => seedFirestore()}>
                <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>[DEV] Inicjalizuj bazę (Nowy Sącz)</Text>
              </TouchableOpacity>

            </Animated.View>
          )}

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 40 },
  particle: { position: 'absolute', width: 4, height: 4, backgroundColor: Colors.neonGreen, borderRadius: 2, shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  content: { alignItems: 'center', zIndex: 10, width: '100%' },
  trophyContainer: { marginBottom: Spacing.xl },
  trophyGlow: { shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 },
  title: { fontSize: FontSize['5xl'], color: Colors.white, fontWeight: '800', letterSpacing: -0.5, marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { color: Colors.gray, fontSize: FontSize.base, marginBottom: 48, textAlign: 'center' },

  // Stary widok (przyciski startowe)
  buttonsContainer: { width: 280, gap: Spacing.lg },
  schoolInfo: { color: Colors.gray, fontSize: FontSize.sm, marginTop: 48, textAlign: 'center' },

  // Nowy widok (Formularz)
  formSection: { width: '100%', maxWidth: 400, gap: Spacing.md },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md, alignSelf: 'flex-start' },
  backButtonText: { color: Colors.gray, fontSize: FontSize.sm, fontWeight: '600' },

  tabContainer: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.full, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.full },
  tabActive: { backgroundColor: 'rgba(0, 230, 118, 0.2)' },
  tabText: { color: Colors.gray, fontWeight: '600', fontSize: FontSize.sm },
  tabTextActive: { color: Colors.neonGreen, fontWeight: '800' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: Spacing.md },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, color: Colors.white, fontSize: FontSize.base, paddingVertical: 14 },

  dropdownContainer: { width: '100%' },
  dropdownSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  dropdownText: { color: Colors.white, fontSize: FontSize.sm },
  dropdownListInline: { marginTop: 4, backgroundColor: '#1E2335', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  dropdownItemText: { color: Colors.white, fontSize: FontSize.sm },

  addSchoolToggle: { alignSelf: 'flex-start', paddingVertical: 4 },
  addSchoolToggleText: { color: Colors.orange, fontSize: FontSize.sm, fontWeight: '700' },
  newSchoolContainer: { gap: Spacing.md, marginTop: 4, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },

  primaryButton: { width: '100%', paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: Colors.neonGreen, alignItems: 'center', shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  primaryButtonText: { color: Colors.bgDeep, fontWeight: '800', fontSize: FontSize.md },

  outlineButton: { width: '100%', paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, borderWidth: 2, borderColor: Colors.neonGreen, backgroundColor: 'transparent', alignItems: 'center' },
  outlineButtonText: { color: Colors.neonGreen, fontWeight: '700', fontSize: FontSize.md },
});
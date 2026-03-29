import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { User, Bell, Shield, Database, Settings, LogOut, Mail, Phone, Trash2, Save, Eye, School } from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { supabase } from '../config/supabase';

export default function TeacherSettings() {
  const navigation = useNavigation();

  // --- STANY ---
  // Profil nauczyciela
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Dane konta
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Powiadomienia
  const [notifyNewTests, setNotifyNewTests] = useState(true);
  const [notifyNewStudents, setNotifyNewStudents] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Preferencje widoku
  const [showUntestedOnly, setShowUntestedOnly] = useState(false);
  const [theme, setTheme] = useState(true); // true = ciemny

  // Integracje (Status Supabase)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSupabaseConnected(false);
        return;
      }
      setIsSupabaseConnected(true);

      setEmail(user.email || '');

      const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (error) throw error;

      if (data) {
        setPhone(data.phone || '');
        setSchoolName(data.school || '');
        if (data.name) {
          const parts = data.name.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        setAvatarUrl(data.avatar || '');
      }
    } catch (e) {
      console.error("Błąd pobierania danych:", e);
      setIsSupabaseConnected(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Brak zalogowanego użytkownika.");

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      if (phone.trim() !== '') {
        const cleanPhone = phone.replace(/[\s-]/g, '');
        const phoneRegex = /^\+?[0-9]{9,15}$/;
        if (!phoneRegex.test(cleanPhone)) {
          Alert.alert("Błąd", "Podaj prawidłowy numer telefonu (min. 9 cyfr).");
          setIsSaving(false);
          return;
        }
      }

      // Aktualizacja profilu w tabeli users
      const { error: dbError } = await supabase.from('users').update({
        name: fullName,
        school: schoolName,
        avatar: avatarUrl,
        phone: phone,
      }).eq('id', user.id);

      if (dbError) throw dbError;

      // Aktualizacja maila przez Auth (tylko email)
      if (email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: email,
        });
        if (authError) throw authError;

        Alert.alert(
          "Sukces",
          "Ustawienia zapisane!\nJeśli zmieniłeś email, konieczne może być jego potwierdzenie."
        );
      } else {
        Alert.alert("Sukces", "Ustawienia zostały zapisane pomyślnie.");
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Błąd", e.message || "Nie udało się zapisać ustawień.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Wyloguj", "Czy na pewno chcesz się wylogować?", [
      { text: "Anuluj", style: "cancel" },
      { text: "Wyloguj", style: "destructive", onPress: async () => {
          await supabase.auth.signOut();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
          );
      }}
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Usuń konto",
      "Tej akcji nie można cofnąć! Czy na pewno chcesz trwale usunąć swoje konto?",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", style: "destructive", onPress: async () => {
            try {
               const { error } = await supabase.rpc('delete_user');
               if (error) {
                 Alert.alert("Błąd", "Funkcja automatycznego usuwania konta nie jest dostepna. Skontaktuj się z administratorem.");
               } else {
                 await supabase.auth.signOut();
                 navigation.dispatch(
                   CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
                 );
               }
            } catch(e) {
               Alert.alert("Błąd", "Funkcja usuwania konta nie jest skonfigurowana po stronie serwera.");
            }
        }}
      ]
    );
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserSettings();
    setIsRefreshing(false);
  };

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Musisz być zalogowany");

        const asset = result.assets[0];

        // 1. Unikalna nazwa pliku dla użytkownika
        const fileExt = asset.uri.split('.').pop() || 'jpg';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        // 2. Bezpieczny upload plików w React Native odbywa się przez FormData
        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || 'image/jpeg',
        } as any);

        // 3. Upload na Supabase Storage (bucket "avatars")
        const { error: uploadError } = await supabase.storage
           .from('avatars')
           .upload(fileName, formData, { upsert: true });

        if (uploadError) throw uploadError;

        // 4. Pobieranie publicznego linku i ustawianie state
        const { data: { publicUrl } } = supabase.storage
           .from('avatars')
           .getPublicUrl(fileName);

        setAvatarUrl(publicUrl);
        Alert.alert("Sukces", "Zdjęcie awatara zaktualizowane! Teraz wciśnij Zapisz Ustawienia na dole.");
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Błąd", "Nie udało się przesłać zdjęcia. Upewnij się, że bucket 'avatars' istnieje. " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <NeonIcon Icon={Settings} size={28} color={Colors.neonGreen} glow />
        <Text style={styles.headerTitle}>Ustawienia Trenera</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.neonGreen} />
        }
      >
        {/* SEKCJA: PROFIL NAUCZYCIELA */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <User size={20} color={Colors.neonGreen} />
            <Text style={styles.sectionTitle}>Profil Nauczyciela</Text>
          </View>

          <View style={styles.contentPadded}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Imię</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={firstName || "Twoje Imię"}
                  placeholderTextColor={Colors.gray}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nazwisko</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={lastName || "Twoje Nazwisko"}
                  placeholderTextColor={Colors.gray}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nazwa Szkoły / Klubu Sportowego</Text>
              <View style={styles.inputContainer}>
                <School size={18} color={Colors.gray} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder={schoolName || "Nazwa szkoły lub klubu"}
                  placeholderTextColor={Colors.gray}
                  value={schoolName}
                  onChangeText={setSchoolName}
                />
              </View>
            </View>

            {/* AVATAR UPLOAD */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handlePickAvatar} disabled={isUploading} style={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                     <User size={32} color={Colors.gray} />
                  </View>
                )}
                {isUploading && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Kliknij awatar, aby go zmienić</Text>
            </View>
          </View>
        </NeonCard>

        {/* SEKCJA: DANE KONTA */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={Colors.neonGreenDark} />
            <Text style={styles.sectionTitle}>Dane Konta</Text>
          </View>

          <View style={styles.contentPadded}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Adres E-mail</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={Colors.gray} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Zmień adres e-mail"
                  placeholderTextColor={Colors.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Numer Telefonu</Text>
              <View style={styles.inputContainer}>
                <Phone size={18} color={Colors.gray} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Podepnij numer telefonu"
                  placeholderTextColor={Colors.gray}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </NeonCard>

        {/* SEKCJA: POWIADOMIENIA */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={Colors.orange} />
            <Text style={styles.sectionTitle}>Powiadomienia</Text>
          </View>

          <View style={styles.contentPadded}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Powiadamiaj o nowo wykonanych testach przez uczniów</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={notifyNewTests ? Colors.neonGreen : Colors.gray}
                onValueChange={setNotifyNewTests}
                value={notifyNewTests}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Powiadamiaj o nowych uczniach w grupie</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={notifyNewStudents ? Colors.neonGreen : Colors.gray}
                onValueChange={setNotifyNewStudents}
                value={notifyNewStudents}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Cotygodniowy raport podsumowujący na e-mail</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={weeklyReport ? Colors.neonGreen : Colors.gray}
                onValueChange={setWeeklyReport}
                value={weeklyReport}
              />
            </View>
          </View>
        </NeonCard>

        {/* SEKCJA: PREFERENCJE WIDOKU */}
        <NeonCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Eye size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Preferencje Widoku</Text>
          </View>

          <View style={styles.contentPadded}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Domyślnie pokazuj tylko uczniów nieprzetestowanych</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={showUntestedOnly ? Colors.neonGreen : Colors.gray}
                onValueChange={setShowUntestedOnly}
                value={showUntestedOnly}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Ciemny Motyw Aplikacji</Text>
              <Switch
                trackColor={{ false: '#3A4A5A', true: 'rgba(0, 230, 118, 0.5)' }}
                thumbColor={theme ? Colors.neonGreen : Colors.gray}
                onValueChange={setTheme}
                value={theme}
              />
            </View>
          </View>
        </NeonCard>

        {/* ZAPISZ USTAWIENIA */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.bgDeep} />
          ) : (
            <>
              <Save size={20} color={Colors.bgDeep} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Zapisz Ustawienia</Text>
            </>
          )}
        </TouchableOpacity>

        {/* SEKCJA: ZARZĄDZANIE KONTEM (WYLOGUJ/USUŃ) */}
        <View style={styles.accountActionSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Wyloguj Się</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 size={20} color={Colors.red} style={{ marginRight: 8 }} />
            <Text style={styles.deleteButtonText}>Usuń Konto</Text>
          </TouchableOpacity>
        </View>

        {/* SEKCJA: INTEGRACJE (SUPABASE) */}
        <View style={styles.footerRow}>
          <Text style={styles.statusLabel}>Baza:</Text>
          {isSupabaseConnected === null ? (
            <Text style={[styles.statusValue, { color: Colors.gray }]}>Sprawdzanie...</Text>
          ) : isSupabaseConnected ? (
            <Text style={{ color: Colors.neonGreen, fontSize: FontSize.xs, fontWeight: 'bold' }}>POŁĄCZONO</Text>
          ) : (
            <Text style={{ color: Colors.red, fontSize: FontSize.xs, fontWeight: 'bold' }}>BŁĄD POŁĄCZENIA</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>SportRecrut Wersja 1.0.0</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bgDeep,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
    gap: Spacing.lg,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.md,
    marginLeft: Spacing.sm,
  },
  contentPadded: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },

  // Inputs
  inputWrapper: {
    gap: 4,
  },
  inputLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginLeft: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.base,
    paddingVertical: 12,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },

  // Switches
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    color: Colors.white,
    fontSize: FontSize.sm,
    flex: 1,
    paddingRight: Spacing.md,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.neonGreen,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: Colors.bgDeep,
    fontSize: FontSize.base,
    fontWeight: '800',
  },

  // Account Actions
  accountActionSection: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 71, 87, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: Colors.red,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  // Status (Supabase)
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 8,
  },
  statusLabel: {
    color: Colors.white,
    fontSize: FontSize.xs,
  },
  statusValue: {
    fontWeight: '600',
    fontSize: FontSize.xs,
  },

  // Footer
  footer: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  versionText: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  }
});
